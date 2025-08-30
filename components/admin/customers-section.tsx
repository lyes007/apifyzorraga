'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Package, 
  TrendingUp,
  Filter,
  Download,
  Eye,
  Star,
  Clock,
  DollarSign,
  ShoppingCart
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Customer {
  email: string
  firstName: string
  lastName: string
  phone: string
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  lastOrderDate: string
  firstOrderDate: string
  city: string
  country: string
  status: 'active' | 'inactive' | 'vip'
}

interface CustomersProps {
  onBack?: () => void
}

export default function CustomersSection({ onBack }: CustomersProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'spent' | 'recent'>('spent')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'vip'>('all')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders?limit=1000')
      const data = await response.json()

      if (response.ok) {
        const orders = data.orders || []
        
        // Process orders to extract customer data
        const customerMap = new Map()
        
        orders.forEach((order: any) => {
          const email = order.customerEmail
          if (!customerMap.has(email)) {
            customerMap.set(email, {
              email,
              firstName: order.customerFirstName,
              lastName: order.customerLastName,
              phone: order.customerPhone || '',
              totalOrders: 0,
              totalSpent: 0,
              orders: [],
              city: order.shippingAddress?.city || '',
              country: order.shippingAddress?.country || ''
            })
          }
          
          const customer = customerMap.get(email)
          customer.totalOrders += 1
          customer.totalSpent += Number(order.totalAmount) || 0
          customer.orders.push({
            date: order.createdAt,
            amount: Number(order.totalAmount) || 0
          })
        })

        // Calculate additional metrics and determine status
        const processedCustomers = Array.from(customerMap.values()).map((customer: any) => {
          customer.orders.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          customer.averageOrderValue = customer.totalSpent / customer.totalOrders
          customer.lastOrderDate = customer.orders[0]?.date
          customer.firstOrderDate = customer.orders[customer.orders.length - 1]?.date
          
          // Determine status
          const daysSinceLastOrder = customer.lastOrderDate 
            ? Math.floor((Date.now() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
            : 365
          
          if (customer.totalSpent > 1000) {
            customer.status = 'vip'
          } else if (daysSinceLastOrder > 90) {
            customer.status = 'inactive'
          } else {
            customer.status = 'active'
          }
          
          delete customer.orders
          return customer
        })

        setCustomers(processedCustomers)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} TND`
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr })
  }

  const getCustomerInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'vip': return 'VIP'
      case 'active': return 'Actif'
      case 'inactive': return 'Inactif'
      default: return 'Standard'
    }
  }

  // Filter and sort customers
  const filteredAndSortedCustomers = customers
    .filter(customer => {
      const matchesSearch = searchTerm === '' || 
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      
      const matchesStatus = filterStatus === 'all' || customer.status === filterStatus
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'orders':
          return b.totalOrders - a.totalOrders
        case 'spent':
          return b.totalSpent - a.totalSpent
        case 'recent':
          return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
        default:
          return 0
      }
    })

  const totalCustomers = customers.length
  const vipCustomers = customers.filter(c => c.status === 'vip').length
  const activeCustomers = customers.filter(c => c.status === 'active').length
  const averageOrderValue = customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / customers.length || 0

  if (loading) {
    return (
      <div className="space-y-6 admin-dashboard">
        <div className="h-32 bg-muted rounded-lg admin-skeleton"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg admin-skeleton"></div>
          ))}
        </div>
        <div className="admin-responsive-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg admin-skeleton"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 admin-dashboard w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Gestion des Clients</h1>
              <p className="text-xl text-white/90 mb-4">
                Base de données clients avec analytics avancés
              </p>
              <div className="flex items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{totalCustomers} clients total</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <span>{vipCustomers} clients VIP</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold shadow-lg border border-emerald-200"
              >
                <Download className="h-5 w-5 mr-2" />
                Exporter Données
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="admin-metric-card overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-blue-700">{totalCustomers}</h3>
              <p className="text-sm text-blue-600 font-medium">Clients Total</p>
              <p className="text-xs text-muted-foreground">
                {activeCustomers} actifs
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-metric-card overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 via-green-100/80 to-teal-100/50 border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-md">
                <Star className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-emerald-800">{vipCustomers}</h3>
              <p className="text-sm text-emerald-700 font-medium">Clients VIP</p>
              <p className="text-xs text-emerald-600/80">
                {((vipCustomers / totalCustomers) * 100).toFixed(1)}% du total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-metric-card overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 via-blue-100/80 to-indigo-100/50 border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-blue-800">
                {formatPrice(averageOrderValue)}
              </h3>
              <p className="text-sm text-blue-700 font-medium">Panier Moyen</p>
              <p className="text-xs text-blue-600/80">
                Par commande
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-metric-card overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-purple-700">
                {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
              </h3>
              <p className="text-sm text-purple-600 font-medium">Commandes Total</p>
              <p className="text-xs text-muted-foreground">
                Toutes périodes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="modern-admin-card">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100/50">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtres & Recherche Clients
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher nom, email, téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 focus:border-primary transition-colors"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border-2 border-border rounded-md px-3 py-2 focus:border-primary transition-colors"
            >
              <option value="all">Tous les statuts</option>
              <option value="vip">VIP</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border-2 border-border rounded-md px-3 py-2 focus:border-primary transition-colors"
            >
              <option value="spent">Montant dépensé</option>
              <option value="orders">Nombre de commandes</option>
              <option value="name">Nom</option>
              <option value="recent">Commande récente</option>
            </select>

            <div className="text-sm text-muted-foreground flex items-center">
              {filteredAndSortedCustomers.length} client{filteredAndSortedCustomers.length > 1 ? 's' : ''} trouvé{filteredAndSortedCustomers.length > 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      <div className="admin-responsive-grid">
        {filteredAndSortedCustomers.map((customer, index) => (
          <Card
            key={customer.email}
            className="modern-admin-card cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 border-2 border-primary/20 customer-avatar">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {getCustomerInitials(customer.firstName, customer.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <Badge className={`${getStatusColor(customer.status)} enhanced-status-badge text-xs mt-1`}>
                      {getStatusLabel(customer.status)}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="admin-action-btn hover:bg-primary/10 hover:text-primary"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Details */}
              <div className="space-y-2">
                <div className="customer-contact-item">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm truncate">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="customer-contact-item">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm">{customer.phone}</span>
                  </div>
                )}
                {customer.city && (
                  <div className="customer-contact-item">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm">{customer.city}, {customer.country}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="pt-3 border-t space-y-3">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-lg font-bold text-blue-700">{customer.totalOrders}</p>
                    <p className="text-xs text-blue-600">Commandes</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-lg font-bold text-emerald-700">
                      {formatPrice(customer.totalSpent).replace(' TND', '')}
                    </p>
                    <p className="text-xs text-emerald-600">Dépensé</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Panier moyen: {formatPrice(customer.averageOrderValue)}
                  </p>
                  {customer.lastOrderDate && (
                    <p className="text-xs text-muted-foreground">
                      Dernière commande: {formatDate(customer.lastOrderDate)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedCustomers.length === 0 && (
        <Card className="modern-admin-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun client trouvé</h3>
            <p className="text-muted-foreground text-center mb-6">
              Aucun client ne correspond à vos critères de recherche.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
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
