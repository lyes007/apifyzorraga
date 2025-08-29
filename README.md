# Zorraga Car Parts - E-commerce Platform

A professional automotive parts search and e-commerce platform powered by TecDoc database integration.

## Features

### 🔍 Parts Search
- **Vehicle-based search**: Find compatible parts by selecting manufacturer, model, and year
- **Reference-based search**: Search by article number or reference
- **Real-time filtering**: Filter by supplier and search terms
- **Professional TecDoc integration**: Access to comprehensive automotive parts database

### 🛒 E-commerce Functionality
- **Shopping cart**: Add items to cart from search results and article details
- **Cart management**: Update quantities, remove items, view cart total
- **Checkout process**: Complete order with shipping information
- **Mock pricing**: All articles currently priced at €29.99 for demonstration

### 🎨 Modern UI/UX
- **Responsive design**: Works seamlessly on desktop and mobile devices
- **Dark/Light theme**: Toggle between themes
- **Professional styling**: Clean, modern interface with smooth animations
- **Accessibility**: Screen reader friendly with proper ARIA labels

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database (for future database integration)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zorraga-car-parts
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Create .env.local file
DATABASE_URL='postgresql://neondb_owner:npg_rVa1ZdTnN2fp@ep-silent-tooth-abvgfbej-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Searching for Parts

1. **Vehicle Search**:
   - Select manufacturer (e.g., BMW, Mercedes)
   - Choose model and year
   - Browse available categories
   - View compatible parts

2. **Reference Search**:
   - Enter article number or reference
   - Get instant results
   - View part details and compatibility

### Shopping Cart

1. **Adding Items**:
   - Click "Panier" button on any article card
   - Or click "Ajouter au panier" on article details page
   - Items are automatically added to cart

2. **Managing Cart**:
   - Click cart icon in header to open cart drawer
   - Update quantities with +/- buttons
   - Remove items with trash icon
   - View total price and item count

3. **Checkout**:
   - Click "Passer la commande" in cart
   - Fill in shipping information
   - Complete order (currently simulated)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── checkout/          # Checkout page
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── article-details.tsx    # Article detail view
│   ├── articles-list.tsx      # Articles grid display
│   ├── article-search.tsx     # Reference search
│   ├── cart-drawer.tsx        # Shopping cart sidebar
│   ├── categories-display.tsx # Product categories
│   ├── header.tsx             # Site header with cart
│   └── vehicle-selector.tsx   # Vehicle selection
├── hooks/                # Custom React hooks
│   └── use-cart.tsx      # Cart state management
├── lib/                  # Utility libraries
│   └── apify-api.ts      # TecDoc API integration
└── styles/               # Global styles
```

## Database Integration

The project is prepared for PostgreSQL integration with the following schema:

- **Users**: Customer accounts and authentication
- **Orders**: Customer orders and status tracking
- **Order Items**: Individual items in orders
- **Cart Items**: Temporary cart storage
- **Product Prices**: Article pricing information
- **Addresses**: Shipping address management

See `database-schema.sql` for complete schema definition.

## API Integration

### TecDoc API
- **Article Search**: Find parts by reference number
- **Vehicle Compatibility**: Get compatible parts for specific vehicles
- **Article Details**: Retrieve comprehensive part information
- **Image Integration**: Product images via S3 storage

### Cart Management
- **Local State**: Cart data managed with React Context
- **Persistence**: Ready for database storage integration
- **Real-time Updates**: Instant cart updates across components

## Future Enhancements

- [ ] User authentication and accounts
- [ ] Database integration for cart persistence
- [ ] Payment gateway integration
- [ ] Order tracking and management
- [ ] Inventory management
- [ ] Multi-language support
- [ ] Advanced filtering and sorting
- [ ] Wishlist functionality
- [ ] Customer reviews and ratings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software for Zorraga Pièces Auto.

## Support

For technical support or questions, please contact the development team.

---

**Note**: This is a demonstration version with mock pricing. All articles are currently priced at €29.99 for testing purposes.
