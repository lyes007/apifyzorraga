'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
}

interface AdminOverviewProps {
  onNavigate: (view: 'orders') => void
}

export default function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders?limit=1000')
      const data = await response.json()

      if (response.ok) {
        const orders = data.orders || []
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

        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} TND`
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
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre activité e-commerce
          </p>
        </div>
        <Button onClick={() => onNavigate('orders')}>
          Gérer les Commandes
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Toutes les commandes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Commandes en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livrées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">
              Commandes terminées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Chiffre d'affaires total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onNavigate('orders')}
            >
              <Package className="h-6 w-6" />
              <span>Gérer les Commandes</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/')}
            >
              <Users className="h-6 w-6" />
              <span>Voir le Site</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => window.location.reload()}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Actualiser</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {stats.totalOrders} commande{stats.totalOrders > 1 ? 's' : ''} au total
                </p>
                <p className="text-xs text-muted-foreground">
                  Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
            
            {stats.pendingOrders > 0 && (
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-yellow-50">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    {stats.pendingOrders} commande{stats.pendingOrders > 1 ? 's' : ''} en attente
                  </p>
                  <p className="text-xs text-yellow-600">
                    Nécessitent votre attention
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
