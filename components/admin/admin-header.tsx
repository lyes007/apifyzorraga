'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Package, 
  Home, 
  LogOut, 
  Menu, 
  X,
  Settings,
  Bell,
  Search,
  Users,
  BarChart3,
  Shield,
  HelpCircle,
  Sun,
  Moon
} from 'lucide-react'
import { useTheme } from 'next-themes'

export function AdminHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [notifications] = useState(3) // Mock notification count

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                  <Package className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Zorraga Admin
                </h1>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  Interface d'administration
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="h-10 px-4 hover:bg-primary/10 hover:text-primary transition-all duration-200">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="ghost" size="sm" className="h-10 px-4 hover:bg-primary/10 hover:text-primary transition-all duration-200">
                <Home className="h-4 w-4 mr-2" />
                Site Client
              </Button>
            </Link>

            <Button variant="ghost" size="sm" className="h-10 px-4 hover:bg-primary/10 hover:text-primary transition-all duration-200">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Search Button - Desktop Only */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden lg:flex h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
                >
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 transition-transform hover:rotate-180 duration-300" />
              ) : (
                <Moon className="h-4 w-4 transition-transform hover:rotate-180 duration-300" />
              )}
            </Button>

            {/* Admin Avatar */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border/50">
              <Avatar className="h-8 w-8 lg:h-10 lg:w-10 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-muted-foreground">Administrateur</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="lg:hidden h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 transition-transform rotate-90" />
              ) : (
                <Menu className="h-5 w-5 transition-transform" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-md border-b border-border/50 shadow-lg animate-slide-down">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Admin Profile */}
            <div className="flex items-center gap-3 p-4 mb-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
              <Avatar className="h-12 w-12 border-2 border-primary/30">
                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                  AD
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-primary">Administrateur</p>
                <p className="text-sm text-muted-foreground">Interface de gestion</p>
              </div>
              <div className="ml-auto">
                {notifications > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    {notifications}
                  </Badge>
                )}
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link href="/admin" onClick={closeMobileMenu}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-left hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                  <BarChart3 className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Tableau de Bord</p>
                    <p className="text-xs text-muted-foreground">Vue d'ensemble</p>
                  </div>
                </Button>
              </Link>

              <Link href="/admin" onClick={closeMobileMenu}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-left hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                  <Package className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Commandes</p>
                    <p className="text-xs text-muted-foreground">Gestion des commandes</p>
                  </div>
                </Button>
              </Link>

              <Link href="/admin" onClick={closeMobileMenu}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-left hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                  <Users className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Clients</p>
                    <p className="text-xs text-muted-foreground">Base de données clients</p>
                  </div>
                </Button>
              </Link>

              <Button 
                variant="ghost" 
                className="w-full justify-start h-12 text-left hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <Settings className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">Paramètres</p>
                  <p className="text-xs text-muted-foreground">Configuration</p>
                </div>
              </Button>

              <div className="border-t border-border/50 pt-2 mt-4">
                <Link href="/" onClick={closeMobileMenu}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 text-left border-primary/30 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    <Home className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">Retour au Site</p>
                      <p className="text-xs text-muted-foreground">Interface client</p>
                    </div>
                  </Button>
                </Link>

                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-left text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200 mt-2"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Déconnexion</p>
                    <p className="text-xs opacity-70">Quitter l'admin</p>
                  </div>
                </Button>
              </div>
            </nav>

            {/* Mobile Help Section */}
            <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <p className="font-medium text-sm">Besoin d'aide ?</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Consultez la documentation ou contactez le support technique
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}