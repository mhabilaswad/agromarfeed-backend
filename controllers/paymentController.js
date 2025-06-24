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

    // Hanya proses jika ada order_id
    if (!notification.order_id) {
      console.log('❌ Notifikasi tidak mengandung order_id, diabaikan.');
      return res.status(200).json({ message: 'Not a payment notification, ignored.' });
    }

    // Langsung gunakan data notifikasi dari Midtrans (tanpa cek status lagi)
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    console.log('📊 Processing order:', orderId, 'Status:', transactionStatus, 'Fraud:', fraudStatus);

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

    // Update order di database
    let updatedOrder = await Order.findOneAndUpdate(
      { orderId: orderId },
      {
        status: orderStatus,
        payment_status: paymentStatus,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedOrder) {
      // Coba update by midtrans_order_id
      updatedOrder = await Order.findOneAndUpdate(
        { midtrans_order_id: orderId },
        {
          status: orderStatus,
          payment_status: paymentStatus,
          updatedAt: new Date()
        },
        { new: true }
      );
    }

    if (!updatedOrder) {
      console.log('❌ Order not found for orderId or midtrans_order_id:', orderId);
    } else {
      console.log('✅ Order updated:', updatedOrder);
    }

    // Return success response ke Midtrans
    res.status(200).json({ message: 'Notification processed successfully' });

  } catch (error) {
    console.error('❌ Payment notification error:', error);
    res.status(500).json({ message: 'Failed to process payment notification', error: error.message });
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

// Create payment token for a consultation appointment
exports.createConsultationPayment = async (req, res) => {
  try {
    const { appointmentId, items, customerDetails } = req.body;

    if (!appointmentId || !items || !customerDetails) {
      return res.status(400).json({ 
        message: 'Missing required fields: appointmentId, items, customerDetails' 
      });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Prepare order data for Midtrans
    const orderData = {
      orderId: `consult_${appointmentId}`,
      totalAmount,
      items,
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone,
      // Tidak perlu shipping/billing address untuk konsultasi
    };

    console.log('orderData for Midtrans:', orderData);
    // Create payment token
    const paymentToken = await createPaymentToken(orderData);

    res.json({
      success: true,
      token: paymentToken.token,
      redirect_url: paymentToken.redirect_url,
    });
  } catch (error) {
    console.error('Consultation payment creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create consultation payment', 
      error: error.message 
    });
  }
}; 