'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, Home, LogOut } from 'lucide-react'

export function AdminHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Zorraga Admin</h1>
              <p className="text-sm text-muted-foreground">Gestion des commandes</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Tableau de bord
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Retour au site
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
