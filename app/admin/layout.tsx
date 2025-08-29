import { Metadata } from 'next'
import { AdminHeader } from '@/components/admin/admin-header'

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
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}
