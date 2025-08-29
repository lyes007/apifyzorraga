import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

// CSS must be imported first - before any components
import "../styles/globals.css"
import "./output.css"

import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/hooks/use-cart"

export const metadata: Metadata = {
  title: "Zorraga Pièces Auto - Recherche de Pièces Automobiles",
  description: "Trouvez facilement les pièces automobiles compatibles avec votre véhicule",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CartProvider>
            {children}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
