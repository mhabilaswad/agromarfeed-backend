# AgroMarFeed Backend

Backend untuk aplikasi AgroMarFeed dengan fitur cart, checkout, shipping, dan payment integration.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Buat file `.env` di root folder backend dengan konfigurasi berikut:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/agromarfeed

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Midtrans Configuration
MIDTRANS_SERVER_KEY=SB-Mid-server-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MIDTRANS_CLIENT_KEY=SB-Mid-client-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MIDTRANS_IS_PRODUCTION=false

# RajaOngkir Komerce Configuration
RAJAONGKIR_API_KEY=YOUR_RAJAONGKIR_KOMERCE_API_KEY

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 3. RajaOngkir Komerce Setup
1. Daftar di [RajaOngkir Komerce](https://rajaongkir.komerce.id/)
2. Dapatkan API Key dari dashboard
3. Update `RAJAONGKIR_API_KEY` di file `.env`

### 4. Midtrans Setup
1. Daftar di [Midtrans](https://midtrans.com/)
2. Dapatkan Server Key dan Client Key dari dashboard
3. Update `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY` di file `.env`

### 5. Run Development Server
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout user

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item
- `DELETE /api/cart/remove/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID

### Shipping
- `GET /api/shipping/provinces` - Get provinces
- `GET /api/shipping/cities/:provinceId` - Get cities by province
- `POST /api/shipping/calculate` - Calculate shipping cost
- `GET /api/shipping/couriers` - Get available couriers

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status

### Payment
- `POST /api/payment/create` - Create payment
- `POST /api/payment/notification` - Payment notification webhook

## Features

### Cart Management
- Add/remove items
- Update quantities
- Calculate totals
- Persistent cart data

### Shipping Integration
- RajaOngkir Komerce integration
- Province and city selection
- Shipping cost calculation
- Multiple courier options

### Payment Integration
- Midtrans integration
- Multiple payment methods
- Payment status tracking
- Webhook handling

### Order Management
- Order creation
- Status tracking
- Order history
- Invoice generation 