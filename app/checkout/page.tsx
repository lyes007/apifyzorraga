"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ShoppingCart, CreditCard, Truck, CheckCircle } from "lucide-react"
import { RobustProductImage } from "@/components/ui/robust-product-image"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const { state, getTotalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Tunisia",
    notes: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    try {
      // Create order in database
      const orderData = {
        customerFirstName: formData.firstName,
        customerLastName: formData.lastName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          addressLine1: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        billingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          addressLine1: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        orderItems: state.items.map(item => ({
          articleId: item.articleId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          supplier: item.supplier,
          articleNo: item.articleNo,
          image: item.image
        })),
        subtotal: getTotalPrice(),
        totalAmount: totalWithShipping,
        shippingCost: shippingCost,
        notes: formData.notes
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const result = await response.json()
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsProcessing(false)
      setIsCompleted(true)
      clearCart()
    } catch (error) {
      console.error('Error creating order:', error)
      setIsProcessing(false)
      // You could add error handling here
    }
  }

  const shippingCost = getTotalPrice() >= 50 ? 0 : 15.99
  const totalWithShipping = getTotalPrice() + shippingCost

  // Prevent redirect during static generation
  useEffect(() => {
    if (state.items.length === 0 && !isCompleted) {
      router.push("/")
    }
  }, [state.items.length, isCompleted, router])

  if (state.items.length === 0 && !isCompleted) {
    return null
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Commande confirmée !
                </h1>
                <p className="text-muted-foreground mb-6">
                  Merci pour votre commande. Vous recevrez un email de confirmation dans les prochaines minutes.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => router.push("/")} className="w-full">
                    Continuer les achats
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Finaliser la commande</h1>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Résumé de la commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                                             <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                         <RobustProductImage
                           s3ImageLink={item.image}
                           imageLink={item.image}
                           imageMedia={item.image}
                           alt={item.name}
                           className="w-full h-full"
                           size="sm"
                           showDebug={false}
                         />
                       </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {item.supplier} • Qté: {item.quantity}
                        </p>
                      </div>
                                             <div className="text-right">
                         <p className="font-medium">{(item.price * item.quantity).toFixed(2)} TND</p>
                       </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                                     <div className="space-y-2">
                     <div className="flex justify-between">
                       <span>Sous-total:</span>
                       <span>{getTotalPrice().toFixed(2)} TND</span>
                     </div>
                     <div className="flex justify-between">
                       <span>Livraison:</span>
                       <span>{shippingCost === 0 ? "Gratuit" : `${shippingCost.toFixed(2)} TND`}</span>
                     </div>
                     {shippingCost > 0 && (
                       <p className="text-xs text-muted-foreground">
                         Livraison gratuite à partir de 50 TND
                       </p>
                     )}
                     <Separator />
                     <div className="flex justify-between text-lg font-bold">
                       <span>Total:</span>
                       <span>{totalWithShipping.toFixed(2)} TND</span>
                     </div>
                   </div>
                </CardContent>
              </Card>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Informations de livraison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName">Prénom *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nom *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Adresse *</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Label htmlFor="city">Ville *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Code postal *</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Pays</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notes de commande</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Instructions spéciales, commentaires..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Informations de paiement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground text-center">
                        Mode de paiement sécurisé - Paiement à la livraison
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Traitement en cours...
                    </>
                  ) : (
                                         <>
                       <CreditCard className="h-4 w-4 mr-2" />
                       Confirmer la commande ({totalWithShipping.toFixed(2)} TND)
                     </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
