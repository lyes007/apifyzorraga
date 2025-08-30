'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  Package, 
  User, 
  Mail, 
  Phone, 
  ArrowLeft,
  MapPin,
  Clock,
  TrendingUp,
  Download,
  RefreshCw,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Order {
  id: string
  orderNumber: string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string
  status: string
  totalAmount: number | string | any
  createdAt: string
  orderItems: Array<{
    id: string
    name: string
    quantity: number
    price: number | string | any
  }>
  shippingAddress: {
    addressLine1: string
    city: string
    postalCode: string
    country: string
  }
}

interface AdminDashboardProps {
  onViewOrder: (orderId: string) => void
  onBack?: () => void
}

const statusConfig = {
  PENDING: { 
    label: 'En attente', 
    color: 'status-pending bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-300',
    icon: Clock,
    priority: 'high'
  },
  CONFIRMED: { 
    label: 'Confirmée', 
    color: 'status-confirmed bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300',
    icon: CheckCircle,
    priority: 'medium'
  },
  PROCESSING: { 
    label: 'En traitement', 
    color: 'status-processing bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-300',
    icon: Package,
    priority: 'medium'
  },
  SHIPPED: { 
    label: 'Expédiée', 
    color: 'status-shipped bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border-indigo-300',
    icon: Truck,
    priority: 'low'
  },
  DELIVERED: { 
    label: 'Livrée', 
    color: 'status-delivered bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-400',
    icon: CheckCircle,
    priority: 'low'
  },
  CANCELLED: { 
    label: 'Annulée', 
    color: 'status-cancelled bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300',
    icon: XCircle,
    priority: 'low'
  }
}

export default function AdminDashboard({ onViewOrder, onBack }: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    startDate: '',
    endDate: ''
  })

  const fetchOrders = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
      setLoading(true)
      }
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...filters
      })

      const response = await fetch(`/api/admin/orders?${params}`)
      const data = await response.json()

      if (response.ok) {
        setOrders(data.orders || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalOrders(data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [currentPage, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr })
  }

  const formatDateShort = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yy', { locale: fr })
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

  const getCustomerInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getItemsCount = (orderItems: any[]) => {
    return orderItems.reduce((total, item) => total + item.quantity, 0)
  }

  const handleRefresh = () => {
    fetchOrders(true)
  }

  if (loading && !refreshing) {
    return (
      <div className="space-y-6 admin-dashboard">
        {/* Loading Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted rounded-lg admin-skeleton"></div>
            <div className="h-4 w-48 bg-muted rounded admin-skeleton"></div>
          </div>
          <div className="h-10 w-32 bg-muted rounded-lg admin-skeleton"></div>
        </div>

        {/* Loading Filters */}
        <Card className="modern-admin-card">
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded admin-skeleton"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded-lg admin-skeleton"></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loading Grid */}
        <div className="admin-responsive-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg admin-skeleton"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 admin-dashboard w-full max-w-full overflow-x-hidden">
      {/* Mobile-Optimized Enhanced Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {onBack && (
            <Button onClick={onBack} variant="outline" size="sm" className="admin-action-btn self-start">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          )}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mobile-title">
              Gestion des Commandes
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4 flex-shrink-0" />
                <span className="mobile-body">{totalOrders} commande{totalOrders > 1 ? 's' : ''} au total</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span className="mobile-body">{new Set(orders.map(o => o.customerEmail)).size} clients uniques</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="admin-action-btn mobile-touch-target flex-shrink-0"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
          <div className="flex items-center border rounded-lg p-1 bg-muted/20 w-full sm:w-auto">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="flex-1 sm:flex-none px-3 mobile-touch-target"
            >
              Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="flex-1 sm:flex-none px-3 mobile-touch-target"
            >
              Table
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card className="modern-admin-card w-full max-w-full overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100/50">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtres & Recherche
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher commande, client, email..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 border-2 focus:border-primary transition-colors mobile-touch-target text-base sm:text-sm"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="border-2 focus:border-primary transition-colors">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(statusConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="border-2 focus:border-primary transition-colors"
              placeholder="Date de début"
            />

            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="border-2 focus:border-primary transition-colors"
              placeholder="Date de fin"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile-Optimized Orders Display */}
      {viewMode === 'cards' ? (
        <div className="mobile-card-grid lg:grid-cols-3">
          {orders.map((order, index) => {
            const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
            const StatusIcon = statusInfo?.icon || Package
            
            return (
              <Card
                key={order.id}
                className="modern-admin-card cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => onViewOrder(order.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/20 customer-avatar">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getCustomerInitials(order.customerFirstName, order.customerLastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-lg">
                          {order.customerFirstName} {order.customerLastName}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">
                          #{order.orderNumber}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${statusInfo?.color} enhanced-status-badge`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo?.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Contact */}
                  <div className="space-y-2">
                    <div className="customer-contact-item">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-sm truncate">{order.customerEmail}</span>
                    </div>
                    {order.customerPhone && (
                      <div className="customer-contact-item">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="text-sm">{order.customerPhone}</span>
                      </div>
                    )}
                    <div className="customer-contact-item">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm truncate">
                        {order.shippingAddress.city}, {order.shippingAddress.country}
                      </span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateShort(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>{getItemsCount(order.orderItems)} articles</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="admin-action-btn border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-400 shadow-sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="modern-admin-card">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100/50">
            <CardTitle>Liste des Commandes</CardTitle>
        </CardHeader>
          <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-4 font-semibold">Client</th>
                    <th className="text-left p-4 font-semibold">Contact</th>
                    <th className="text-left p-4 font-semibold">Commande</th>
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-left p-4 font-semibold">Montant</th>
                    <th className="text-left p-4 font-semibold">Statut</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                  {orders.map((order, index) => {
                    const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
                    const StatusIcon = statusInfo?.icon || Package
                    
                    return (
                      <tr
                        key={order.id}
                        className="admin-table-row hover:bg-muted/30 cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => onViewOrder(order.id)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-primary/20">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getCustomerInitials(order.customerFirstName, order.customerLastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">
                                {order.customerFirstName} {order.customerLastName}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                #{order.orderNumber}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                      <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-primary" />
                              <span className="truncate max-w-48">{order.customerEmail}</span>
                            </div>
                            {order.customerPhone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{order.customerPhone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Package className="h-4 w-4 text-primary" />
                            <span>{getItemsCount(order.orderItems)} articles</span>
                      </div>
                    </td>
                        <td className="p-4 text-sm">{formatDate(order.createdAt)}</td>
                        <td className="p-4">
                          <span className="font-semibold text-lg text-primary">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge className={`${statusInfo?.color} enhanced-status-badge`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo?.label}
                      </Badge>
                    </td>
                        <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                            className="admin-action-btn border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-400 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onViewOrder(order.id)
                            }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                    </td>
                  </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Pagination */}
          {totalPages > 1 && (
        <Card className="modern-admin-card">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </p>
              <div className="text-sm text-muted-foreground">
                {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, totalOrders)} sur {totalOrders} commandes
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="admin-action-btn"
              >
                Première
              </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                className="admin-action-btn"
                >
                <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                className="admin-action-btn"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="admin-action-btn"
              >
                Dernière
                </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {orders.length === 0 && !loading && (
        <Card className="modern-admin-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucune commande trouvée</h3>
            <p className="text-muted-foreground text-center mb-6">
              Aucune commande ne correspond à vos critères de recherche.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ status: 'all', search: '', startDate: '', endDate: '' })
                setCurrentPage(1)
              }}
              className="admin-action-btn border-primary/30 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary/50"
            >
              Réinitialiser les filtres
            </Button>
        </CardContent>
      </Card>
      )}
    </div>
  )
}