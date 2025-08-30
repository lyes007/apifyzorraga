'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Package, User, MapPin, Calendar, Phone, Mail, Truck, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number | string | any // Can be Decimal from Prisma
  supplier: string
  articleNo: string
}

interface Address {
  id: string
  addressLine1: string
  city: string
  postalCode: string
  country: string
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
  totalAmount: number | string | any // Can be Decimal from Prisma
  shippingCost: number | string | any // Can be Decimal from Prisma
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
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmée' },
  { value: 'PROCESSING', label: 'En traitement' },
  { value: 'SHIPPED', label: 'Expédiée' },
  { value: 'DELIVERED', label: 'Livrée' },
  { value: 'CANCELLED', label: 'Annulée' }
]

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export default function OrderDetail({ orderId, onBack }: OrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')

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
        await fetchOrder() // Refresh order data
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
      // Convert Decimal to number if needed
      const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price)
      if (isNaN(numericPrice)) {
        console.warn('Invalid price value:', price)
        return '0.00 TND'
      }
      return `${numericPrice.toFixed(2)} TND`
    } catch (error) {
      console.error('Error formatting price:', error, 'Price value:', price)
      return '0.00 TND'
    }
  }

  const getNumericPrice = (price: number | string | any): number => {
    try {
      const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price)
      return isNaN(numericPrice) ? 0 : numericPrice
    } catch (error) {
      console.error('Error converting price to number:', error, 'Price value:', price)
      return 0
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Commande non trouvée</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Commande {order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Créée le {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom</label>
                  <p className="font-medium">{`${order.customerFirstName} ${order.customerLastName}`}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium">{order.customerEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                  <p className="font-medium">{order.customerPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Articles Commandés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Réf: {item.articleNo} | Fournisseur: {item.supplier}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.quantity}x</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} chacun
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Adresse de Livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {order.shippingAddress.addressLine1}<br />
                  {order.shippingAddress.postalCode} {order.shippingAddress.city}<br />
                  {order.shippingAddress.country}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Adresse de Facturation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {order.billingAddress.addressLine1}<br />
                  {order.billingAddress.postalCode} {order.billingAddress.city}<br />
                  {order.billingAddress.country}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé de la Commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span>{formatPrice(getNumericPrice(order.totalAmount) - getNumericPrice(order.shippingCost))}</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison:</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Mettre à Jour le Statut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Notes (optionnel)"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
              />

              <Button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === order.status}
                className="w-full"
              >
                {updating ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle>Statut Actuel</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${statusColors[order.status as keyof typeof statusColors]} text-sm`}>
                {statusOptions.find(opt => opt.value === order.status)?.label || order.status}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Statuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.orderHistory.map((status, index) => (
              <div key={status.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={statusColors[status.status as keyof typeof statusColors]}>
                      {statusOptions.find(opt => opt.value === status.status)?.label || status.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(status.createdAt)}
                    </span>
                  </div>
                  {status.notes && (
                    <p className="text-sm text-muted-foreground">{status.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Mis à jour par: {status.createdBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
