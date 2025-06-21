const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agromarfeed')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import models
const Order = require('./models/order/Order');

async function checkOrder() {
  try {
    const orderId = 'ORDER-1750491234248-0kg47s7sx';
    console.log(`🔍 Checking order: ${orderId}\n`);

    // 1. Check by orderId
    console.log('1. Searching by orderId...');
    let order = await Order.findOne({ orderId: orderId })
      .populate('user_id', 'name email')
      .populate('order_item.product_id', 'name price');
    
    if (order) {
      console.log('✅ Found by orderId:', {
        _id: order._id,
        orderId: order.orderId,
        status: order.status,
        payment_status: order.payment_status,
        user: order.user_id?.name,
        items: order.order_item.length,
        createdAt: order.createdAt
      });
    } else {
      console.log('❌ Not found by orderId');
    }

    // 2. Check by midtrans_order_id
    console.log('\n2. Searching by midtrans_order_id...');
    order = await Order.findOne({ midtrans_order_id: orderId })
      .populate('user_id', 'name email')
      .populate('order_item.product_id', 'name price');
    
    if (order) {
      console.log('✅ Found by midtrans_order_id:', {
        _id: order._id,
        orderId: order.orderId,
        status: order.status,
        payment_status: order.payment_status,
        user: order.user_id?.name,
        items: order.order_item.length,
        createdAt: order.createdAt
      });
    } else {
      console.log('❌ Not found by midtrans_order_id');
    }

    // 3. Check recent orders
    console.log('\n3. Recent orders in database:');
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderId midtrans_order_id _id user_id status payment_status createdAt');
    
    recentOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderId} - ${order.status} - ${order.payment_status} - ${order.createdAt}`);
    });

    // 4. Check if order exists with similar ID
    console.log('\n4. Searching for similar order IDs...');
    const similarOrders = await Order.find({
      orderId: { $regex: 'ORDER-1750491234248', $options: 'i' }
    }).select('orderId midtrans_order_id _id status payment_status createdAt');
    
    if (similarOrders.length > 0) {
      console.log('Found similar orders:');
      similarOrders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.orderId} - ${order.status} - ${order.payment_status}`);
      });
    } else {
      console.log('No similar orders found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

checkOrder(); 