const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agromarfeed')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import models
const Order = require('./models/order/Order');
const Cart = require('./models/cart/Cart');
const User = require('./models/user/User');

async function testOrders() {
  try {
    console.log('\n🔍 === TESTING ORDERS AND CART ===\n');

    // 1. Check all orders
    console.log('📋 1. ALL ORDERS:');
    const allOrders = await Order.find()
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Total orders: ${allOrders.length}`);
    allOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderId} - ${order.user_id?.name} - ${order.status} - ${order.payment_status} - ${order.createdAt}`);
    });

    // 2. Check all carts
    console.log('\n🛒 2. ALL CARTS:');
    const allCarts = await Cart.find()
      .populate('user_id', 'name email');
    
    console.log(`Total carts: ${allCarts.length}`);
    allCarts.forEach((cart, index) => {
      console.log(`${index + 1}. User: ${cart.user_id?.name} - Items: ${cart.cart_item?.length || 0}`);
    });

    // 3. Check paid orders
    console.log('\n✅ 3. PAID ORDERS:');
    const paidOrders = await Order.find({ 
      $or: [
        { payment_status: 'paid' },
        { status: 'processing' }
      ]
    }).populate('user_id', 'name email');
    
    console.log(`Paid orders: ${paidOrders.length}`);
    paidOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderId} - ${order.user_id?.name} - ${order.status} - ${order.payment_status}`);
    });

    // 4. Check for cart clearing issues
    console.log('\n🧹 4. CART CLEARING CHECK:');
    for (const order of paidOrders) {
      const cart = await Cart.findOne({ user_id: order.user_id });
      console.log(`User: ${order.user_id?.name} - Cart items: ${cart?.cart_item?.length || 0}`);
      
      if (cart?.cart_item?.length > 0) {
        console.log(`  ⚠️  Cart not cleared! Items: ${cart.cart_item.length}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

testOrders(); 