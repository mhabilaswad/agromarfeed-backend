const { createPaymentToken, handlePaymentNotification, checkPaymentStatus, cancelPayment } = require('../utils/midtransApi');
const Order = require('../models/order/Order');
const Cart = require('../models/cart/Cart');

// Create payment token for an order
exports.createPayment = async (req, res) => {
  try {
    const { orderId, items, customerDetails, shippingDetails } = req.body;

    // Validate required fields
    if (!orderId || !items || !customerDetails || !shippingDetails) {
      return res.status(400).json({ 
        message: 'Missing required fields: orderId, items, customerDetails, shippingDetails' 
      });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Prepare order data for Midtrans
    const orderData = {
      orderId,
      totalAmount,
      items,
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone,
      billingAddress: customerDetails.address,
      billingCity: customerDetails.city,
      billingPostalCode: customerDetails.postalCode,
      shippingAddress: shippingDetails.address,
      shippingCity: shippingDetails.city,
      shippingPostalCode: shippingDetails.postalCode,
    };

    // Create payment token
    const paymentToken = await createPaymentToken(orderData);

    res.json({
      success: true,
      token: paymentToken.token,
      redirect_url: paymentToken.redirect_url,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create payment', 
      error: error.message 
    });
  }
};

// Handle payment notification from Midtrans
exports.paymentNotification = async (req, res) => {
  try {
    const notification = req.body;
    console.log('📨 Received payment notification in paymentController:', JSON.stringify(notification, null, 2));
    
    // Process the notification
    const statusResponse = await handlePaymentNotification(notification);
    console.log('📋 Status response:', JSON.stringify(statusResponse, null, 2));
    
    // Update order status in database
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`🔍 Processing order: ${orderId}`);
    console.log(`📊 Transaction status: ${transactionStatus}`);
    console.log(`🛡️ Fraud status: ${fraudStatus}`);

    let orderStatus = 'pending';
    let paymentStatus = 'pending';
    
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        orderStatus = 'pending';
        paymentStatus = 'pending';
      } else if (fraudStatus === 'accept') {
        orderStatus = 'processing';
        paymentStatus = 'paid';
      }
    } else if (transactionStatus === 'settlement') {
      orderStatus = 'processing';
      paymentStatus = 'paid';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      orderStatus = 'cancelled';
      paymentStatus = 'failed';
    } else if (transactionStatus === 'pending') {
      orderStatus = 'pending';
      paymentStatus = 'pending';
    }

    console.log(`📝 Final order status: ${orderStatus}, payment status: ${paymentStatus}`);

    // Find and update order in database
    // Try multiple ways to find the order
    let order = await Order.findOneAndUpdate(
      { orderId: orderId },
      { 
        status: orderStatus,
        payment_status: paymentStatus,
        midtrans_transaction_id: statusResponse.transaction_id,
        updatedAt: new Date()
      },
      { new: true }
    );

    // If not found by orderId, try by midtrans_order_id
    if (!order) {
      console.log(`🔍 Order not found by orderId: ${orderId}, trying by midtrans_order_id`);
      order = await Order.findOneAndUpdate(
        { midtrans_order_id: orderId },
        { 
          status: orderStatus,
          payment_status: paymentStatus,
          midtrans_transaction_id: statusResponse.transaction_id,
          updatedAt: new Date()
        },
        { new: true }
      );
    }

    // If still not found, try by _id
    if (!order) {
      console.log(`🔍 Order not found by midtrans_order_id: ${orderId}, trying by _id`);
      // Only try findById if the orderId looks like a valid ObjectId (24 character hex string)
      if (/^[0-9a-fA-F]{24}$/.test(orderId)) {
        order = await Order.findByIdAndUpdate(
          orderId,
          { 
            status: orderStatus,
            payment_status: paymentStatus,
            midtrans_transaction_id: statusResponse.transaction_id,
            updatedAt: new Date()
          },
          { new: true }
        );
      } else {
        console.log(`🔍 Skipping findById - orderId is not a valid ObjectId: ${orderId}`);
      }
    }

    if (!order) {
      console.log(`❌ Order not found for orderId: ${orderId}`);
      
      // List some recent orders for debugging
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderId midtrans_order_id _id user_id status payment_status createdAt');
      
      console.log('📋 Recent orders for debugging:', recentOrders);
      
      return res.status(404).json({ 
        message: 'Order not found',
        searchedId: orderId,
        recentOrders: recentOrders
      });
    }

    console.log(`✅ Order updated successfully: ${order._id}`);
    console.log(`👤 User ID: ${order.user_id}`);
    console.log(`📊 New status: ${order.status}, payment_status: ${order.payment_status}`);

    // If payment is successful, clear the user's cart
    if (paymentStatus === 'paid' && order && order.user_id) {
      try {
        console.log(`🧹 Clearing cart for user: ${order.user_id}`);
        
        // First, check current cart
        const currentCart = await Cart.findOne({ user_id: order.user_id });
        console.log(`📦 Current cart items: ${currentCart?.cart_item?.length || 0}`);
        
        if (currentCart && currentCart.cart_item && currentCart.cart_item.length > 0) {
          // Clear the cart
          const clearedCart = await Cart.findOneAndUpdate(
            { user_id: order.user_id },
            { cart_item: [] },
            { new: true }
          );
          
          console.log(`✅ Cart cleared successfully. New cart items: ${clearedCart?.cart_item?.length || 0}`);
          
          // Also try to clear cart by removing specific items that were in the order
          if (order.order_item && order.order_item.length > 0) {
            const orderProductIds = order.order_item.map(item => item.product_id);
            console.log(`🎯 Removing specific products from cart:`, orderProductIds);
            
            await Cart.findOneAndUpdate(
              { user_id: order.user_id },
              { 
                $pull: { 
                  cart_item: { 
                    product_id: { $in: orderProductIds } 
                  } 
                } 
              }
            );
          }
        } else {
          console.log(`📦 Cart already empty or not found for user: ${order.user_id}`);
        }
        
      } catch (cartError) {
        console.error('❌ Error clearing cart:', cartError);
      }
    } else {
      console.log(`⏭️ Skipping cart clearing. Payment status: ${paymentStatus}, User ID: ${order?.user_id}`);
    }

    res.status(200).json({ 
      message: 'Notification processed successfully',
      orderStatus: orderStatus,
      paymentStatus: paymentStatus,
      cartCleared: paymentStatus === 'paid'
    });

  } catch (error) {
    console.error('❌ Payment notification error:', error);
    res.status(500).json({ 
      message: 'Failed to process payment notification', 
      error: error.message 
    });
  }
};

// Check payment status
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const statusResponse = await checkPaymentStatus(orderId);
    
    res.json({
      success: true,
      data: statusResponse
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ 
      message: 'Failed to check payment status', 
      error: error.message 
    });
  }
};

// Cancel payment
exports.cancelPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const cancelResponse = await cancelPayment(orderId);
    
    // Update order status in database
    await Order.findOneAndUpdate(
      { orderId: orderId },
      { 
        status: 'cancelled',
        payment_status: 'failed',
        updatedAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Payment cancelled successfully',
      data: cancelResponse
    });

  } catch (error) {
    console.error('Payment cancellation error:', error);
    res.status(500).json({ 
      message: 'Failed to cancel payment', 
      error: error.message 
    });
  }
};

// Get payment client key for frontend
exports.getClientKey = async (req, res) => {
  try {
    res.json({
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get client key', 
      error: error.message 
    });
  }
}; 