'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Eye, Calendar, Package, User, Mail, Phone, ArrowLeft } from 'lucide-react'
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
  totalAmount: number | string | any // Can be Decimal from Prisma
  createdAt: string
  orderItems: Array<{
    id: string
    name: string
    quantity: number
    price: number | string | any // Can be Decimal from Prisma
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

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export default function AdminDashboard({ onViewOrder, onBack }: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    startDate: '',
    endDate: ''
  })

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...filters
      })

      const response = await fetch(`/api/admin/orders?${params}`)
      const data = await response.json()

      if (response.ok) {
        console.log('Orders data received:', data.orders)
        console.log('Pagination data:', data.pagination)
        setOrders(data.orders || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalOrders(data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
            <p className="text-muted-foreground">
              {totalOrders} commande{totalOrders > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                <SelectItem value="PROCESSING">En traitement</SelectItem>
                <SelectItem value="SHIPPED">Expédiée</SelectItem>
                <SelectItem value="DELIVERED">Livrée</SelectItem>
                <SelectItem value="CANCELLED">Annulée</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              placeholder="Date de début"
            />

            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              placeholder="Date de fin"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">N° Commande</th>
                  <th className="text-left p-2">Client</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Montant</th>
                  <th className="text-left p-2">Statut</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-mono text-sm">{order.orderNumber}</td>
                    <td className="p-2">
                      <div className="space-y-1">
                        <div className="font-medium">{`${order.customerFirstName} ${order.customerLastName}`}</div>
                        <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                      </div>
                    </td>
                    <td className="p-2 text-sm">{formatDate(order.createdAt)}</td>
                    <td className="p-2 font-medium">{formatPrice(order.totalAmount)}</td>
                    <td className="p-2">
                      <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewOrder(order.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
