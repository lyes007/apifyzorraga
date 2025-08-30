'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  Truck, 
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Download,
  Share,
  Edit,
  Save,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number | string | any
  supplier: string
  articleNo: string
}

interface Address {
  id: string
  addressLine1: string
  addressLine2?: string
  city: string
  postalCode: string
  country: string
  phone?: string
}

interface StatusHistory {
  id: string
  status: string
  notes: string
  createdBy: string
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string
  status: string
  totalAmount: number | string | any
  shippingCost: number | string | any
  createdAt: string
  orderItems: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
  orderHistory: StatusHistory[]
}

interface OrderDetailProps {
  orderId: string
  onBack: () => void
}

const statusOptions = [
  { value: 'PENDING', label: 'En attente', icon: Clock, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'CONFIRMED', label: 'Confirmée', icon: CheckCircle, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'PROCESSING', label: 'En traitement', icon: Package, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'SHIPPED', label: 'Expédiée', icon: Truck, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'DELIVERED', label: 'Livrée', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'CANCELLED', label: 'Annulée', icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200' }
]

export default function OrderDetail({ orderId, onBack }: OrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [editingCustomer, setEditingCustomer] = useState(false)
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/orders/${orderId}`)
      const data = await response.json()

      if (response.ok) {
        setOrder(data.order)
        setNewStatus(data.order.status)
        setCustomerData({
          firstName: data.order.customerFirstName,
          lastName: data.order.customerLastName,
          email: data.order.customerEmail,
          phone: data.order.customerPhone
        })
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!order || !newStatus) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: statusNotes
        })
      })

      if (response.ok) {
        await fetchOrder()
        setStatusNotes('')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr })
  }

  const formatPrice = (price: number | string | any) => {
    try {
      const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price)
      if (isNaN(numericPrice)) return '0.00 TND'
      return `${numericPrice.toFixed(2)} TND`
    } catch (error) {
      return '0.00 TND'
    }
  }

  const getNumericPrice = (price: number | string | any): number => {
    try {
      const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price)
      return isNaN(numericPrice) ? 0 : numericPrice
    } catch (error) {
      return 0
    }
  }

  const getCustomerInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const currentStatusInfo = statusOptions.find(opt => opt.value === order?.status)

  if (loading) {
    return (
      <div className="space-y-6 admin-dashboard">
        <div className="flex items-center gap-4">
          <div className="h-10 w-20 bg-muted rounded admin-skeleton"></div>
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted rounded admin-skeleton"></div>
            <div className="h-4 w-48 bg-muted rounded admin-skeleton"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg admin-skeleton"></div>
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg admin-skeleton"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Commande non trouvée</h3>
          <p className="text-muted-foreground mb-4">
            La commande demandée n'existe pas ou a été supprimée.
          </p>
          <Button 
            onClick={onBack} 
            variant="outline" 
            className="admin-action-btn border-primary/30 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 admin-dashboard">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={onBack} 
            variant="outline" 
            size="sm" 
            className="admin-action-btn border-primary/30 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Commande #{order.orderNumber}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(order.orderNumber)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Créée le {formatDate(order.createdAt)}</span>
              </div>
              {currentStatusInfo && (
                <Badge className={`${currentStatusInfo.color} enhanced-status-badge`}>
                  <currentStatusInfo.icon className="h-3 w-3 mr-1" />
                  {currentStatusInfo.label}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="admin-action-btn border-primary/30 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary/50"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="admin-action-btn border-primary/30 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary/50"
          >
            <Share className="h-4 w-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Enhanced Customer Information */}
          <Card className="modern-admin-card">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Informations Client
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCustomer(!editingCustomer)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {editingCustomer ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20 border-4 border-blue-100 customer-avatar">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-bold">
                    {getCustomerInitials(order.customerFirstName, order.customerLastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  {editingCustomer ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Prénom"
                        value={customerData.firstName}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                      <Input
                        placeholder="Nom"
                        value={customerData.lastName}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                      <Input
                        placeholder="Email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      />
                      <Input
                        placeholder="Téléphone"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                      <div className="col-span-2 flex gap-2">
                        <Button size="sm" className="admin-action-btn">
                          <Save className="h-4 w-4 mr-2" />
                          Sauvegarder
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingCustomer(false)}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400"
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="customer-info-card">
                          <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
                          <p className="text-lg font-semibold">{order.customerFirstName} {order.customerLastName}</p>
                        </div>
                        <div className="customer-info-card">
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </label>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-blue-600">{order.customerEmail}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(order.customerEmail)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {order.customerPhone && (
                          <div className="customer-info-card">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Téléphone
                            </label>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-green-600">{order.customerPhone}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(order.customerPhone)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="customer-info-card">
                          <label className="text-sm font-medium text-muted-foreground">Première commande</label>
                          <p className="font-medium">Oui</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="modern-admin-card">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-green-100/50">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Articles Commandés ({order.orderItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {order.orderItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-6 hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-lg">{item.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="font-mono bg-muted px-2 py-1 rounded">
                              Réf: {item.articleNo}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              {item.supplier}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">
                            {item.quantity}x
                          </span>
                          <span className="text-lg text-muted-foreground">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-green-600">
                          Total: {formatPrice(getNumericPrice(item.price) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="modern-admin-card">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-purple-100/50">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-purple-600" />
                  Adresse de Livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <p className="font-medium">{order.shippingAddress.addressLine1}</p>
                      {order.shippingAddress.addressLine2 && (
                        <p className="text-muted-foreground">{order.shippingAddress.addressLine2}</p>
                      )}
                      <p className="font-medium">
                        {order.shippingAddress.postalCode} {order.shippingAddress.city}
                      </p>
                      <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                    </div>
                  </div>
                  {order.shippingAddress.phone && (
                    <div className="flex items-center gap-3 pt-2 border-t">
                      <Phone className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">{order.shippingAddress.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="modern-admin-card">
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-orange-100/50">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  Adresse de Facturation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <p className="font-medium">{order.billingAddress.addressLine1}</p>
                      {order.billingAddress.addressLine2 && (
                        <p className="text-muted-foreground">{order.billingAddress.addressLine2}</p>
                      )}
                      <p className="font-medium">
                        {order.billingAddress.postalCode} {order.billingAddress.city}
                      </p>
                      <p className="text-muted-foreground">{order.billingAddress.country}</p>
                    </div>
                  </div>
                  {order.billingAddress.phone && (
                    <div className="flex items-center gap-3 pt-2 border-t">
                      <Phone className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">{order.billingAddress.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="modern-admin-card">
            <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-emerald-100/50">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                Résumé de la Commande
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sous-total:</span>
                  <span className="font-medium">
                    {formatPrice(getNumericPrice(order.totalAmount) - getNumericPrice(order.shippingCost))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Livraison:</span>
                  <span className="font-medium">{formatPrice(order.shippingCost)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card className="modern-admin-card">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100/50">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Mettre à Jour le Statut
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="border-2 focus:border-primary">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Notes sur le changement de statut (optionnel)"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
                className="border-2 focus:border-primary"
              />

              <Button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === order.status}
                className="w-full admin-action-btn"
                size="lg"
              >
                {updating ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Mettre à jour
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card className="modern-admin-card">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100/50">
              <CardTitle>Statut Actuel</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              {currentStatusInfo && (
                <Badge className={`${currentStatusInfo.color} enhanced-status-badge text-lg px-4 py-2`}>
                  <currentStatusInfo.icon className="h-5 w-5 mr-2" />
                  {currentStatusInfo.label}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status History */}
      <Card className="modern-admin-card">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100/50">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Historique des Statuts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {order.orderHistory.length > 0 ? (
              order.orderHistory.map((status, index) => {
                const statusInfo = statusOptions.find(opt => opt.value === status.status)
                const StatusIcon = statusInfo?.icon || Clock
                
                return (
                  <div
                    key={status.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-shrink-0 relative">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <StatusIcon className="h-4 w-4 text-white" />
                      </div>
                      {index < order.orderHistory.length - 1 && (
                        <div className="absolute top-8 left-4 w-0.5 h-8 bg-border"></div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        {statusInfo && (
                          <Badge className={`${statusInfo.color} enhanced-status-badge`}>
                            {statusInfo.label}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(status.createdAt)}
                        </span>
                      </div>
                      {status.notes && (
                        <p className="text-sm bg-muted/50 p-3 rounded-lg">{status.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Mis à jour par: <span className="font-medium">{status.createdBy}</span>
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun historique disponible</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}