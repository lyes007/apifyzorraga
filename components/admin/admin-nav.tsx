'use client'

import { Button } from '@/components/ui/button'
import { Package, BarChart3 } from 'lucide-react'

interface AdminNavProps {
  currentView: 'overview' | 'orders' | 'order-detail'
  onNavigate: (view: 'overview' | 'orders') => void
}

export function AdminNav({ currentView, onNavigate }: AdminNavProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      <Button
        variant={currentView === 'overview' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onNavigate('overview')}
        className="flex items-center gap-2"
      >
        <BarChart3 className="h-4 w-4" />
        Vue d'ensemble
      </Button>
      
      <Button
        variant={currentView === 'orders' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onNavigate('orders')}
        className="flex items-center gap-2"
      >
        <Package className="h-4 w-4" />
        Commandes
      </Button>
    </div>
  )
}
