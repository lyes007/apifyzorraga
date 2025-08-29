'use client'

import { useState } from 'react'
import AdminOverview from '@/components/admin/admin-overview'
import AdminDashboard from '@/components/admin/admin-dashboard'
import OrderDetail from '@/components/admin/order-detail'
import { AdminNav } from '@/components/admin/admin-nav'

export default function AdminPage() {
  const [view, setView] = useState<'overview' | 'orders' | 'order-detail'>('overview')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId)
    setView('order-detail')
  }

  const handleBackToOrders = () => {
    setView('orders')
    setSelectedOrderId(null)
  }

  const handleBackToOverview = () => {
    setView('overview')
    setSelectedOrderId(null)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Navigation */}
      {view !== 'order-detail' && (
        <div className="mb-6">
          <AdminNav currentView={view} onNavigate={setView} />
        </div>
      )}
      
      {view === 'overview' && (
        <AdminOverview onNavigate={setView} />
      )}
      
      {view === 'orders' && (
        <AdminDashboard 
          onViewOrder={handleViewOrder} 
          onBack={handleBackToOverview}
        />
      )}
      
      {view === 'order-detail' && selectedOrderId && (
        <OrderDetail
          orderId={selectedOrderId}
          onBack={handleBackToOrders}
        />
      )}
    </div>
  )
}
