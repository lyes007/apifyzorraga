# Database Setup Guide

This guide will help you set up the Prisma database for the Zorraga Car Parts e-commerce application.

## 🗄️ Database Schema Overview

The database includes the following main entities:

- **Users**: Customer accounts and information
- **Addresses**: Shipping and billing addresses
- **Orders**: Complete order information with status tracking
- **OrderItems**: Individual items within orders
- **OrderStatusHistory**: Complete audit trail of order status changes
- **CartItems**: Temporary cart storage for guest users
- **ProductPrices**: Dynamic pricing management

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in your project root:

```env
DATABASE_URL="postgresql://neondb_owner:npg_rVa1ZdTnN2fp@ep-silent-tooth-abvgfbej-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Push Schema to Database

```bash
npm run db:push
```

### 5. Seed Database (Optional)

```bash
npm run db:seed
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Create and apply migrations |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:seed` | Populate database with sample data |

## 🏗️ Database Models

### User Management
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String
  lastName  String
  phone     String?
  addresses Address[]
  orders    Order[]
}
```

### Order Management
```prisma
model Order {
  id            String      @id @default(cuid())
  orderNumber   String      @unique
  status        OrderStatus @default(PENDING)
  customerEmail String
  // ... more fields
  orderItems    OrderItem[]
  orderHistory  OrderStatusHistory[]
}
```

### Order Status Tracking
```prisma
enum OrderStatus {
  PENDING        // Order placed, waiting for confirmation
  CONFIRMED      // Order confirmed, processing
  PROCESSING     // Order being prepared
  READY_TO_SHIP // Order ready for shipping
  SHIPPED        // Order shipped
  IN_TRANSIT     // Order in transit
  DELIVERED      // Order delivered
  CANCELLED      // Order cancelled
  REFUNDED       // Order refunded
  RETURNED       // Order returned
}
```

## 🔄 Order Status Flow

```
PENDING → CONFIRMED → PROCESSING → READY_TO_SHIP → SHIPPED → IN_TRANSIT → DELIVERED
    ↓
CANCELLED / REFUNDED / RETURNED
```

## 💰 Payment Methods

- **CASH_ON_DELIVERY**: Pay when order is delivered
- **BANK_TRANSFER**: Direct bank transfer
- **CREDIT_CARD**: Credit/debit card payment
- **PAYPAL**: PayPal payment
- **STRIPE**: Stripe payment processing

## 🚚 Shipping Information

- **Free shipping** for orders over 50 TND
- **Standard shipping** cost: 15.99 TND
- **Tracking numbers** for shipped orders
- **Estimated delivery** dates

## 📊 Sample Data

The seed script creates:
- Test user account
- Sample addresses
- Sample order with complete status history
- Sample product prices

## 🛠️ Development Workflow

1. **Make schema changes** in `prisma/schema.prisma`
2. **Generate client**: `npm run db:generate`
3. **Push changes**: `npm run db:push`
4. **Update code** to use new schema
5. **Test functionality**

## 🔍 Database Queries

### Get Order with Full Details
```typescript
import { OrderService } from '@/lib/order-service'

const order = await OrderService.getOrderById(orderId)
```

### Create New Order
```typescript
const orderData = {
  customerEmail: 'customer@example.com',
  customerFirstName: 'John',
  customerLastName: 'Doe',
  // ... more fields
}

const { order, orderItems } = await OrderService.createOrder(orderData)
```

### Update Order Status
```typescript
await OrderService.updateOrderStatus({
  orderId: 'order-id',
  status: 'SHIPPED',
  notes: 'Order shipped via courier'
})
```

## 🚨 Important Notes

- **Always backup** your database before schema changes
- **Test migrations** in development first
- **Use transactions** for complex operations
- **Handle errors** gracefully in production
- **Monitor performance** with large datasets

## 🆘 Troubleshooting

### Common Issues

1. **Connection Error**: Check DATABASE_URL in `.env.local`
2. **Schema Push Failed**: Ensure database is accessible
3. **Client Generation Failed**: Check Prisma schema syntax
4. **Migration Conflicts**: Reset database if needed

### Reset Database (Development Only)

```bash
# Drop and recreate database
npx prisma db push --force-reset

# Re-seed with sample data
npm run db:seed
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Next.js Database Integration](https://nextjs.org/docs/app/building-your-application/data-fetching)

## 🎯 Next Steps

After setting up the database:

1. **Integrate with checkout** process
2. **Create admin panel** for order management
3. **Add email notifications** for status changes
4. **Implement payment processing**
5. **Add order tracking** functionality

---

For support, check the project documentation or create an issue in the repository.
