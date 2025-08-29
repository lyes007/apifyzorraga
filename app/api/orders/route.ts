import { NextRequest, NextResponse } from 'next/server'
import { OrderService, CreateOrderData } from '@/lib/order-service'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Received order data:', JSON.stringify(body, null, 2))
    
    // Validate required fields
    if (!body.customerEmail || !body.customerFirstName || !body.customerLastName) {
      console.log('Missing customer info:', { 
        email: body.customerEmail, 
        firstName: body.customerFirstName, 
        lastName: body.customerLastName 
      })
      return NextResponse.json(
        { error: 'Missing required customer information' },
        { status: 400 }
      )
    }

    if (!body.shippingAddress || !body.orderItems || body.orderItems.length === 0) {
      console.log('Missing address or items:', { 
        hasAddress: !!body.shippingAddress, 
        hasItems: !!body.orderItems, 
        itemsLength: body.orderItems?.length 
      })
      return NextResponse.json(
        { error: 'Missing shipping address or order items' },
        { status: 400 }
      )
    }

    // Create order data structure for the service
    const orderData: CreateOrderData = {
      customerEmail: body.customerEmail,
      customerFirstName: body.customerFirstName,
      customerLastName: body.customerLastName,
      customerPhone: body.customerPhone || '',
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress || body.shippingAddress,
      items: body.orderItems,
      subtotal: body.subtotal,
      totalAmount: body.totalAmount,
      shippingCost: body.shippingCost || 0,
      notes: body.notes || '',
      currency: 'TND'
    }

    // Create the order
    const { order, orderItems } = await OrderService.createOrder(orderData)

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        currency: order.currency
      },
      message: 'Order created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating order:', error)
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as any

    if (userId) {
      // Get orders for specific user
      const orders = await OrderService.getUserOrders(userId)
      return NextResponse.json({ success: true, orders })
    } else {
      // Get all orders (admin only)
      const result = await OrderService.getAllOrders(page, limit, status)
      return NextResponse.json({ success: true, ...result })
    }

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
