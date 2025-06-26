const midtransClient = require('midtrans-client');

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
const MIDTRANS_IS_PRODUCTION = 'false';

// Create Snap API instance
const snap = new midtransClient.Snap({
  isProduction: MIDTRANS_IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

// Create Core API instance
const core = new midtransClient.CoreApi({
  isProduction: MIDTRANS_IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

// Create payment token using Snap API
async function createPaymentToken(orderData, type = 'order') {
  try {
    const isAppointment = type === 'appointment';
    const basePath = isAppointment ? '/pembayaranKonsultasi' : '/pembayaran';
    const parameter = {
      transaction_details: {
        order_id: orderData.orderId,
        gross_amount: orderData.totalAmount,
      },
      item_details: orderData.items?.map(item => ({
        id: item.productId,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
      })) || [],
      customer_details: {
        first_name: orderData.customerName,
        email: orderData.customerEmail,
        phone: orderData.customerPhone,
        billing_address: {
          first_name: orderData.customerName,
          phone: orderData.customerPhone,
          address: orderData.billingAddress,
          city: orderData.billingCity,
          postal_code: orderData.billingPostalCode,
        },
        shipping_address: {
          first_name: orderData.customerName,
          phone: orderData.customerPhone,
          address: orderData.shippingAddress,
          city: orderData.shippingCity,
          postal_code: orderData.shippingPostalCode,
        },
      },
      enabled_payments: [
        'credit_card', 'bca_va', 'bni_va', 'bri_va', 'mandiri_clickpay',
        'gopay', 'indomaret', 'danamon_online', 'akulaku', 'shopeepay'
      ],
      credit_card: {
        secure: true,
        installment: {
          required: false,
          terms: {
            bca: [3, 6, 12],
            bni: [3, 6, 12],
            mandiri: [3, 6, 12],
          },
        },
      },
      callbacks: {
        finish: `${process.env.FRONTEND_URL}${basePath}/success?order_id=${orderData.orderId}`,
        error: `${process.env.FRONTEND_URL}${basePath}/error?order_id=${orderData.orderId}`,
        pending: `${process.env.FRONTEND_URL}${basePath}/pending?order_id=${orderData.orderId}`,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    return transaction;
  } catch (error) {
    throw error;
  }
}

// Handle payment notification
async function handlePaymentNotification(notification) {
  try {
    // Langsung return notification dari Midtrans tanpa cek status lagi
    // Karena notifikasi sudah berisi data transaksi yang valid
    console.log('📨 Processing notification:', JSON.stringify(notification, null, 2));
    return notification;
  } catch (error) {
    console.error('❌ Error processing notification:', error);
    throw error;
  }
}

// Check payment status
async function checkPaymentStatus(orderId) {
  try {
    const statusResponse = await core.transaction.status(orderId);
    return statusResponse;
  } catch (error) {
    throw error;
  }
}

// Cancel payment
async function cancelPayment(orderId) {
  try {
    const cancelResponse = await core.transaction.cancel(orderId);
    return cancelResponse;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createPaymentToken,
  handlePaymentNotification,
  checkPaymentStatus,
  cancelPayment,
}; 