"use client"

import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Plus, Minus, ShoppingCart, Trash2, CreditCard } from "lucide-react"
import { RobustProductImage } from "@/components/ui/robust-product-image"
import { useRouter } from "next/navigation"

export function CartDrawer() {
  const { state, removeItem, updateQuantity, closeCart, getTotalPrice } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    closeCart()
    router.push("/checkout")
  }

  if (!state.isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Panier</h2>
              {state.items.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {state.items.length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeCart}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {state.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  Votre panier est vide
                </p>
                <p className="text-sm text-muted-foreground">
                  Ajoutez des articles pour commencer vos achats
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Image */}
                        <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                          <RobustProductImage
                            s3ImageLink={item.image}
                            imageLink={item.image}
                            imageMedia={item.image}
                            alt={item.name}
                            className="w-full h-full"
                            size="md"
                            showDebug={false}
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-2 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            {item.supplier} • {item.articleNo}
                          </p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                                                         <div className="text-right">
                               <p className="text-sm font-semibold">
                                 {(item.price * item.quantity).toFixed(2)} TND
                               </p>
                               <p className="text-xs text-muted-foreground">
                                 {item.price.toFixed(2)} TND l'unité
                               </p>
                             </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t p-4 space-y-4">
                             <div className="flex justify-between items-center text-lg font-semibold">
                 <span>Total:</span>
                 <span>{getTotalPrice().toFixed(2)} TND</span>
               </div>
              
              <Button 
                onClick={handleCheckout}
                className="w-full"
                size="lg"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Passer la commande
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Livraison gratuite à partir de 50 TND d'achat
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
