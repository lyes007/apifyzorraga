'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Package, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingCart,
  Truck,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap,
  CreditCard,
  Globe,
  BarChart3
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  totalCustomers: number
  averageOrderValue: number
  thisMonthOrders: number
  lastMonthOrders: number
  thisMonthRevenue: number
  lastMonthRevenue: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string
  totalAmount: number
  status: string
  createdAt: string
}

interface TopCustomer {
  email: string
  firstName: string
  lastName: string
  phone: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
}

interface AdminOverviewProps {
  onNavigate: (view: 'orders' | 'customers') => void
}

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  PROCESSING: 'bg-purple-100 text-purple-800 border-purple-200',
  SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200'
}

export default function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    thisMonthOrders: 0,
    lastMonthOrders: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders?limit=1000')
      const data = await response.json()

      if (response.ok) {
        const orders = data.orders || []
        
        // Calculate comprehensive stats
        const totalOrders = orders.length
        const pendingOrders = orders.filter((order: any) => 
          ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(order.status)
        ).length
        const completedOrders = orders.filter((order: any) => 
          order.status === 'DELIVERED'
        ).length
        const totalRevenue = orders.reduce((sum: number, order: any) => 
          sum + (Number(order.totalAmount) || 0), 0
        )

        // Calculate customer metrics
        const uniqueCustomers = new Set(orders.map((order: any) => order.customerEmail))
        const totalCustomers = uniqueCustomers.size
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        // Calculate monthly comparisons
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

        const thisMonthOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= thisMonth
        })

        const lastMonthOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= lastMonth && orderDate <= lastMonthEnd
        })

        const thisMonthRevenue = thisMonthOrders.reduce((sum: number, order: any) => 
          sum + (Number(order.totalAmount) || 0), 0
        )
        const lastMonthRevenue = lastMonthOrders.reduce((sum: number, order: any) => 
          sum + (Number(order.totalAmount) || 0), 0
        )

        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue,
          totalCustomers,
          averageOrderValue,
          thisMonthOrders: thisMonthOrders.length,
          lastMonthOrders: lastMonthOrders.length,
          thisMonthRevenue,
          lastMonthRevenue
        })

        // Get recent orders
        const sortedOrders = orders
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
        setRecentOrders(sortedOrders)

        // Calculate top customers
        const customerStats = new Map()
        orders.forEach((order: any) => {
          const email = order.customerEmail
          if (!customerStats.has(email)) {
            customerStats.set(email, {
              email,
              firstName: order.customerFirstName,
              lastName: order.customerLastName,
              phone: order.customerPhone,
              totalOrders: 0,
              totalSpent: 0,
              lastOrderDate: order.createdAt
            })
          }
          const customer = customerStats.get(email)
          customer.totalOrders += 1
          customer.totalSpent += Number(order.totalAmount) || 0
          if (new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
            customer.lastOrderDate = order.createdAt
          }
        })

        const topCustomersArray = Array.from(customerStats.values())
          .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
          .slice(0, 5)
        setTopCustomers(topCustomersArray)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} TND`
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr })
  }

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const getCustomerInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    )
  }

  const ordersGrowth = getGrowthPercentage(stats.thisMonthOrders, stats.lastMonthOrders)
  const revenueGrowth = getGrowthPercentage(stats.thisMonthRevenue, stats.lastMonthRevenue)

  return (
    <div className="space-y-6 lg:space-y-8 admin-dashboard w-full max-w-full overflow-x-hidden">
      {/* Mobile-Optimized Hero Section */}
      <div className="relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 p-6 lg:p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mobile-title">Administration</h1>
              <p className="text-lg lg:text-xl text-white/90 mobile-subtitle">
                Tableau de bord professionnel
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-white/80 text-sm lg:text-base">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                  <span className="mobile-body">{format(new Date(), 'EEEE dd MMMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                  <span className="mobile-body">Mise à jour en temps réel</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:hidden">
              <Button
                onClick={() => onNavigate('orders')}
                size="sm"
                className="bg-white text-blue-700 hover:bg-white/95 hover:text-blue-800 font-semibold mobile-touch-target shadow-md"
              >
                <Package className="h-4 w-4 mr-2" />
                Commandes
              </Button>
              <Button
                onClick={() => onNavigate('customers')}
                size="sm"
                variant="outline"
                className="border-emerald-300/50 text-emerald-100 hover:bg-emerald-500/20 hover:text-emerald-50 hover:border-emerald-300 mobile-touch-target shadow-md"
              >
                <Users className="h-4 w-4 mr-2" />
                Clients
              </Button>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <Button
                onClick={() => onNavigate('orders')}
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 font-semibold shadow-lg border border-blue-200"
              >
                <Package className="h-5 w-5 mr-2" />
                Gérer les Commandes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Key Metrics Grid */}
      <div className="mobile-card-grid lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 via-emerald-100/80 to-green-100/50 border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-md">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center text-emerald-600">
                {revenueGrowth >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(revenueGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-emerald-800">
                {formatPrice(stats.totalRevenue)}
              </h3>
              <p className="text-sm text-emerald-700 font-medium">Revenus Total</p>
              <p className="text-xs text-emerald-600/80">
                Ce mois: {formatPrice(stats.thisMonthRevenue)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 via-blue-100/80 to-indigo-100/50 border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center text-blue-600">
                {ordersGrowth >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(ordersGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-blue-800">
                {stats.totalOrders}
              </h3>
              <p className="text-sm text-blue-700 font-medium">Commandes Total</p>
              <p className="text-xs text-blue-600/80">
                Ce mois: {stats.thisMonthOrders}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center text-purple-600">
                <Target className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-purple-700">
                {stats.totalCustomers}
              </h3>
              <p className="text-sm text-purple-600 font-medium">Clients Uniques</p>
              <p className="text-xs text-muted-foreground">
                Panier moyen: {formatPrice(stats.averageOrderValue)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center text-amber-600">
                <Zap className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-amber-700">
                {stats.pendingOrders}
              </h3>
              <p className="text-sm text-amber-600 font-medium">En Attente</p>
              <p className="text-xs text-muted-foreground">
                Livrées: {stats.completedOrders}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-Optimized Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Commandes Récentes
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Dernières activités clients
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('orders')}
                  className="hidden sm:flex"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir tout
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentOrders.map((order, index) => (
                  <div
                    key={order.id}
                    className="p-6 hover:bg-muted/30 transition-colors cursor-pointer recent-order-item"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => onNavigate('orders')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getCustomerInitials(order.customerFirstName, order.customerLastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">
                              {order.customerFirstName} {order.customerLastName}
                            </p>
                            <Badge
                              variant="secondary"
                              className={`${statusColors[order.status as keyof typeof statusColors]} text-xs`}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{order.customerEmail}</span>
                            </div>
                            {order.customerPhone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{order.customerPhone}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            #{order.orderNumber} • {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(Number(order.totalAmount))}
                        </p>
                        <Button variant="ghost" size="sm" className="text-primary">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Customers */}
        <div>
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100/50">
              <CardTitle className="text-xl flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Meilleurs Clients
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Clients les plus fidèles
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer.email}
                    className="p-4 hover:bg-muted/30 transition-colors top-customer-item"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-amber-200">
                          <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold text-sm">
                            {getCustomerInitials(customer.firstName, customer.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {customer.totalOrders} commandes
                          </span>
                          <span className="text-sm font-bold text-emerald-600">
                            {formatPrice(customer.totalSpent)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg mt-6">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4 hover:bg-blue-50 hover:border-blue-300 border-blue-200"
                  onClick={() => onNavigate('orders')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-blue-700">Gérer Commandes</p>
                      <p className="text-xs text-blue-600/70">
                        {stats.pendingOrders} en attente
                      </p>
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4 hover:bg-emerald-50 hover:border-emerald-300 border-emerald-200"
                  onClick={() => onNavigate('customers')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Users className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-emerald-700">Gérer Clients</p>
                      <p className="text-xs text-emerald-600/70">
                        {stats.totalCustomers} clients
                      </p>
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4 hover:bg-primary/5 hover:border-primary/30"
                  onClick={() => router.push('/')}
                >
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Voir le Site</p>
                      <p className="text-xs text-muted-foreground">
                        Interface client
                      </p>
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4 hover:bg-primary/5 hover:border-primary/30"
                  onClick={() => window.location.reload()}
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Actualiser</p>
                      <p className="text-xs text-muted-foreground">
                        Données en temps réel
                      </p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}