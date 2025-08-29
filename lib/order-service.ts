import { prisma } from './prisma'
import { OrderStatus, PaymentStatus, PaymentMethod, OrderSource } from '@prisma/client'

export interface CreateOrderData {
  userId?: string
  customerEmail: string
  customerFirstName: string
  customerLastName: string
  customerPhone?: string
  shippingAddress: {
    firstName: string
    lastName: string
    company?: string
    addressLine1: string
    addressLine2?: string
    city: string
    state?: string
    postalCode: string
    country?: string
    phone?: string
  }
  billingAddress?: {
    firstName: string
    lastName: string
    company?: string
    addressLine1: string
    addressLine2?: string
    city: string
    state?: string
    postalCode: string
    country?: string
    phone?: string
  }
  items: Array<{
    articleId: number
    articleNo: string
    name: string
    supplier: string
    price: number
    quantity: number
    image?: string
  }>
  subtotal: number
  shippingCost: number
  taxAmount?: number
  totalAmount: number
  currency?: string
  paymentMethod?: PaymentMethod
  notes?: string
  source?: OrderSource
}

export interface UpdateOrderStatusData {
  orderId: string
  status: OrderStatus
  notes?: string
  createdBy?: string
}

export class OrderService {
  // Create a new order
  static async createOrder(data: CreateOrderData) {
    try {
      console.log('OrderService.createOrder called with:', JSON.stringify(data, null, 2))
      
      // Generate order number (format: ORD-YYYYMMDD-XXXX)
      const orderNumber = this.generateOrderNumber()
      
      // Create or get shipping address
      const shippingAddress = await prisma.address.create({
        data: {
          userId: data.userId || undefined,
          type: 'SHIPPING',
          ...data.shippingAddress,
          country: data.shippingAddress.country || 'Tunisia'
        }
      })

      // Create or get billing address (if different from shipping)
      let billingAddressId: string | undefined
      if (data.billingAddress) {
        const billingAddress = await prisma.address.create({
          data: {
            userId: data.userId || undefined,
            type: 'BILLING',
            ...data.billingAddress,
            country: data.billingAddress.country || 'Tunisia'
          }
        })
        billingAddressId = billingAddress.id
      }

      // Create the order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: data.userId,
          customerEmail: data.customerEmail,
          customerFirstName: data.customerFirstName,
          customerLastName: data.customerLastName,
          customerPhone: data.customerPhone,
          shippingAddressId: shippingAddress.id,
          billingAddressId: billingAddressId || shippingAddress.id,
          subtotal: data.subtotal,
          shippingCost: data.shippingCost,
          taxAmount: data.taxAmount || 0,
          totalAmount: data.totalAmount,
          currency: data.currency || 'TND',
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          source: data.source || 'WEBSITE',
          placedAt: new Date()
        }
      })

      // Create order items
      const orderItems = await Promise.all(
        data.items.map(item =>
          prisma.orderItem.create({
            data: {
              orderId: order.id,
              articleId: item.articleId,
              articleNo: item.articleNo,
              name: item.name,
              supplier: item.supplier,
              price: item.price,
              quantity: item.quantity,
              image: item.image
            }
          })
        )
      )

      // Create initial status history
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'PENDING',
          notes: 'Order created',
          createdBy: data.userId || 'guest'
        }
      })

      return { order, orderItems }
    } catch (error) {
      console.error('Error creating order:', error)
      
      // Log more detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      
      // Check if it's a Prisma error
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Prisma error code:', (error as any).code)
        console.error('Prisma error meta:', (error as any).meta)
      }
      
      throw new Error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get order by ID with all related data
  static async getOrderById(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          shippingAddress: true,
          billingAddress: true,
          orderItems: true,
          orderHistory: {
            orderBy: { createdAt: 'desc' }
          }
        }
      })
      return order
    } catch (error) {
      console.error('Error fetching order:', error)
      throw new Error('Failed to fetch order')
    }
  }

  // Get order by order number
  static async getOrderByNumber(orderNumber: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          user: true,
          shippingAddress: true,
          billingAddress: true,
          orderItems: true,
          orderHistory: {
            orderBy: { createdAt: 'desc' }
          }
        }
      })
      return order
    } catch (error) {
      console.error('Error fetching order:', error)
      throw new Error('Failed to fetch order')
    }
  }

  // Get orders for a user
  static async getUserOrders(userId: string) {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          orderItems: true,
          orderHistory: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      return orders
    } catch (error) {
      console.error('Error fetching user orders:', error)
      throw new Error('Failed to fetch user orders')
    }
  }

  // Update order status
  static async updateOrderStatus(data: UpdateOrderStatusData) {
    try {
      // Update order status
      const order = await prisma.order.update({
        where: { id: data.orderId },
        data: {
          status: data.status,
          updatedAt: new Date(),
          // Update specific timestamps based on status
          ...(data.status === 'CONFIRMED' && { placedAt: new Date() }),
          ...(data.status === 'SHIPPED' && { shippedAt: new Date() }),
          ...(data.status === 'DELIVERED' && { deliveredAt: new Date() }),
          ...(data.status === 'CANCELLED' && { cancelledAt: new Date() })
        }
      })

      // Add status to history
      await prisma.orderStatusHistory.create({
        data: {
          orderId: data.orderId,
          status: data.status,
          notes: data.notes,
          createdBy: data.createdBy
        }
      })

      return order
    } catch (error) {
      console.error('Error updating order status:', error)
      throw new Error('Failed to update order status')
    }
  }

  // Update payment status
  static async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus, paymentIntentId?: string) {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus,
          paymentIntentId,
          updatedAt: new Date()
        }
      })
      return order
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw new Error('Failed to update payment status')
    }
  }

  // Get all orders (for admin)
  static async getAllOrders(page = 1, limit = 20, status?: OrderStatus) {
    try {
      const skip = (page - 1) * limit
      
      const where = status ? { status } : {}
      
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            user: true,
            orderItems: true,
            orderHistory: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.order.count({ where })
      ])

      return {
        orders,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw new Error('Failed to fetch orders')
    }
  }

  // Generate unique order number
  private static generateOrderNumber(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    
    return `ORD-${year}${month}${day}-${random}`
  }
}
