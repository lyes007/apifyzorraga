import { Metadata } from 'next'
import { AdminHeader } from '@/components/admin/admin-header'
import '@/styles/admin.css'

export const metadata: Metadata = {
  title: 'Admin - Zorraga Car Parts',
  description: 'Administration des commandes et gestion du site',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background mobile-admin-layout">
      <AdminHeader />
      <main className="pt-16 lg:pt-18 px-4 lg:px-6 pb-8">
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
