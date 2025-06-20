const { createPaymentToken, handlePaymentNotification, checkPaymentStatus, cancelPayment } = require('../utils/midtransApi');
const Order = require('../models/order/Order');

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
    
    // Process the notification
    const statusResponse = await handlePaymentNotification(notification);
    
    // Update order status in database
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let orderStatus = 'pending';
    
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        orderStatus = 'challenge';
      } else if (fraudStatus === 'accept') {
        orderStatus = 'paid';
      }
    } else if (transactionStatus === 'settlement') {
      orderStatus = 'paid';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      orderStatus = 'cancelled';
    } else if (transactionStatus === 'pending') {
      orderStatus = 'pending';
    }

    // Update order in database
    await Order.findOneAndUpdate(
      { orderId: orderId },
      { 
        status: orderStatus,
        paymentStatus: transactionStatus,
        updatedAt: new Date()
      }
    );

    res.status(200).json({ message: 'Notification processed successfully' });

  } catch (error) {
    console.error('Payment notification error:', error);
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
        paymentStatus: 'cancel',
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