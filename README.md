# 🛍️ Kommercio - Full-Stack E-commerce Platform

A modern, full-featured e-commerce platform built with Next.js 14, FastAPI, and PostgreSQL. Features a beautiful UI with dark mode support, comprehensive product management, secure payments, and vendor capabilities.

![Screenshot 2025-05-28 at 8 50 48 PM](https://github.com/user-attachments/assets/edb9bd38-a3e1-4cf7-b4b1-2955351520ef)


## ✨ Features

### 🛒 Customer Features
- **Product Browsing**: Advanced filtering, search, and sorting
- **Shopping Cart**: Real-time cart updates with quantity management
- **Secure Checkout**: Stripe payment integration
- **Order Tracking**: Detailed order history and status updates
- **User Profiles**: Complete profile management and preferences
- **Wishlist**: Save favorite products for later
- **Responsive Design**: Works perfectly on all devices

### 🏪 Vendor Features
- **Vendor Dashboard**: Comprehensive analytics and insights
- **Product Management**: Add, edit, and manage inventory
- **Order Management**: Track and fulfill customer orders
- **Sales Analytics**: Revenue tracking and performance metrics
- **Inventory Control**: Stock management and low-stock alerts

### 🎨 UI/UX Features
- **Dark/Light Mode**: Complete theme support
- **Modern Design**: Glass morphism and gradient effects
- **Animations**: Smooth transitions and loading states
- **Accessibility**: Screen reader friendly and keyboard navigation
- **Mobile First**: Responsive design for all screen sizes

### 🔒 Security & Performance
- **JWT Authentication**: Secure user sessions
- **Password Hashing**: bcrypt encryption
- **CORS Protection**: Secure API endpoints
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Graceful error management
- **Loading States**: Optimized user experience

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful component library
- **Lucide Icons** - Modern icon set
- **React Context** - State management

### Backend
- **FastAPI** - High-performance Python web framework
- **PostgreSQL** - Reliable relational database
- **JWT** - Secure authentication
- **Stripe** - Payment processing
- **Asyncpg** - Async PostgreSQL driver

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** 18+ installed
- **Python** 3.9+ installed
- **PostgreSQL** database
- **Stripe** account for payments

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone git@github.com:yashpandey06/E-Commerce-Application.git
cd ecommerce-fullstack
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

### 4. Database Setup
```sql
-- Create PostgreSQL database
CREATE DATABASE ecommerce_db;

-- The application will automatically create tables on first run
```

### 5. Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce_db

# JWT
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]
```

## 🏃‍♂️ Running the Application

### Development Mode

#### Start the Backend
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Start the Frontend
```bash
# In a new terminal
npm run dev
```

Visit:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Production Deployment

#### Frontend (Vercel)
```bash
# Build the application
npm run build

# Deploy to Vercel
vercel --prod
```

#### Backend (Railway/Heroku)
```bash
# The application is ready for deployment with:
# - vercel.json for Vercel
# - requirements.txt for Python dependencies
# - Automatic table creation
```

## 📁 Project Structure

```
ecommerce-fullstack/
├── app/                          # Next.js app directory
│   ├── api/                     # API route handlers
│   ├── auth/                    # Authentication pages
│   ├── cart/                    # Shopping cart
│   ├── orders/                  # Order management
│   ├── products/                # Product pages
│   ├── profile/                 # User profiles
│   ├── vendor/                  # Vendor dashboard
│   ├── payment/                 # Payment pages
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Homepage
├── components/                   # Reusable components
│   ├── ui/                     # Shadcn/ui components
│   ├── navbar.tsx              # Navigation
│   └── theme-provider.tsx      # Theme management
├── contexts/                     # React contexts
│   ├── auth-context.tsx        # Authentication
│   └── cart-context.tsx        # Shopping cart
├── backend/                      # FastAPI backend
│   ├── main.py                 # Main application
│   ├── requirements.txt        # Python dependencies
│   └── vercel.json            # Deployment config
├── public/                       # Static assets
└── README.md                    # Documentation
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/signup` - Create new account
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `PUT /auth/password` - Change password

### Products
- `GET /products` - List products with filters
- `GET /products/{id}` - Get product details
- `POST /products` - Create product (vendor)
- `PUT /products/{id}` - Update product (vendor)
- `DELETE /products/{id}` - Delete product (vendor)

### Cart
- `GET /cart` - Get user's cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/{id}` - Update cart item
- `DELETE /cart/items/{id}` - Remove from cart

### Orders
- `GET /orders` - List user orders
- `GET /orders/{id}` - Get order details
- `POST /orders` - Create new order
- `PUT /orders/{id}/cancel` - Cancel order

### Payments
- `POST /create-payment-intent` - Create Stripe payment
- `POST /confirm-payment` - Confirm payment

## 🎨 UI Components

The application uses a comprehensive design system with:

- **Theme Support**: Light/dark mode with system preference detection
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Glass Morphism**: Modern UI effects with backdrop blur
- **Animations**: Smooth transitions and loading states
- **Accessibility**: ARIA labels and keyboard navigation

### Color Palette
```css
/* Primary Colors */
--purple-600: #9333ea
--pink-600: #db2777
--orange-500: #f97316

/* Neutral Colors */
--gray-50: #f9fafb
--gray-900: #111827
```

## 🔧 Customization

### Adding New Product Categories
```typescript
// In your products page component
const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "books", label: "Books" },
  // Add your new category here
  { value: "sports", label: "Sports & Outdoors" }
]
```

### Custom Theme Colors
```css
/* In globals.css */
:root {
  --primary: your-color-hsl;
  --secondary: your-color-hsl;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Cart not loading after login**
   - Check if the API URL is correct in environment variables
   - Verify JWT token is being sent with requests

2. **Database connection errors**
   - Ensure PostgreSQL is running
   - Check database credentials in .env file

3. **Stripe payments failing**
   - Verify Stripe keys are correct
   - Check webhook endpoint configuration

4. **Build errors**
   - Clear node_modules and reinstall dependencies
   - Check TypeScript errors in terminal

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn/ui** for the beautiful component library
- **Vercel** for seamless deployment
- **Stripe** for secure payment processing
- **FastAPI** for the excellent Python framework
- **Next.js** team for the amazing React framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/ansh7432/ecommerce-fullstack/issues) page
2. Create a new issue with detailed description
3. Contact: support@kommercio.com

