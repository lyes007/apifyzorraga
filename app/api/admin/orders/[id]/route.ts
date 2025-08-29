import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderService } from '@/lib/order-service'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        shippingAddress: true,
        billingAddress: true,
        orderHistory: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const body = await request.json()
    const { status, notes } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        orderHistory: {
          create: {
            status,
            notes: notes || `Status updated to ${status}`,
            createdBy: 'admin'
          }
        }
      },
      include: {
        orderItems: true,
        shippingAddress: true,
        billingAddress: true,
        orderHistory: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
