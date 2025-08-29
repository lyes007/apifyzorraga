import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      phone: '+21612345678'
    }
  })

  console.log('✅ Created test user:', user.email)

  // Create sample addresses
  const shippingAddress = await prisma.address.upsert({
    where: { id: 'sample-shipping-1' },
    update: {},
    create: {
      id: 'sample-shipping-1',
      userId: user.id,
      type: 'SHIPPING',
      firstName: 'Test',
      lastName: 'User',
      addressLine1: '123 Test Street',
      city: 'Tunis',
      postalCode: '1000',
      country: 'Tunisia',
      phone: '+21612345678',
      isDefault: true
    }
  })

  const billingAddress = await prisma.address.upsert({
    where: { id: 'sample-billing-1' },
    update: {},
    create: {
      id: 'sample-billing-1',
      userId: user.id,
      type: 'BILLING',
      firstName: 'Test',
      lastName: 'User',
      addressLine1: '123 Test Street',
      city: 'Tunis',
      postalCode: '1000',
      country: 'Tunisia',
      phone: '+21612345678',
      isDefault: true
    }
  })

  console.log('✅ Created sample addresses')

  // Create sample order
  const order = await prisma.order.upsert({
    where: { orderNumber: 'ORD-20241201-0001' },
    update: {},
    create: {
      orderNumber: 'ORD-20241201-0001',
      userId: user.id,
      status: 'CONFIRMED',
      customerEmail: user.email,
      customerFirstName: user.firstName,
      customerLastName: user.lastName,
      customerPhone: user.phone,
      shippingAddressId: shippingAddress.id,
      billingAddressId: billingAddress.id,
      subtotal: 59.98,
      shippingCost: 0,
      taxAmount: 0,
      totalAmount: 59.98,
      currency: 'TND',
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'COMPLETED',
      source: 'WEBSITE',
      placedAt: new Date(),
      shippedAt: new Date(),
      deliveredAt: new Date()
    }
  })

  console.log('✅ Created sample order:', order.orderNumber)

  // Create sample order items
  const orderItem1 = await prisma.orderItem.create({
    data: {
      orderId: order.id,
      articleId: 2083695,
      articleNo: '2250038',
      name: 'Pompe à carburant',
      supplier: 'METZGER',
      price: 29.99,
      quantity: 2,
      image: 'https://example.com/image1.jpg'
    }
  })

  console.log('✅ Created sample order items')

  // Create order status history
  await prisma.orderStatusHistory.createMany({
    data: [
      {
        orderId: order.id,
        status: 'PENDING',
        notes: 'Order created',
        createdBy: user.id
      },
      {
        orderId: order.id,
        status: 'CONFIRMED',
        notes: 'Order confirmed by customer service',
        createdBy: user.id
      },
      {
        orderId: order.id,
        status: 'PROCESSING',
        notes: 'Order being prepared for shipping',
        createdBy: user.id
      },
      {
        orderId: order.id,
        status: 'SHIPPED',
        notes: 'Order shipped via local courier',
        createdBy: user.id
      },
      {
        orderId: order.id,
        status: 'DELIVERED',
        notes: 'Order delivered successfully',
        createdBy: user.id
      }
    ]
  })

  console.log('✅ Created order status history')

  // Create sample product prices
  await prisma.productPrice.createMany({
    data: [
      {
        articleId: 2083695,
        price: 29.99,
        currency: 'TND',
        validFrom: new Date(),
        isActive: true
      },
      {
        articleId: 2083696,
        price: 45.50,
        currency: 'TND',
        validFrom: new Date(),
        isActive: true
      }
    ]
  })

  console.log('✅ Created sample product prices')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
