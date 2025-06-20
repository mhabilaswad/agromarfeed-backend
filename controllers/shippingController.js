const axios = require('axios');
const { searchDestination, calculateShipping } = require('../utils/komerceApi');

// RajaOngkir Komerce configuration
const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
const RAJAONGKIR_BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

// ✅ Get provinces (fetch from Komerce API)
exports.getProvinces = async (req, res) => {
  try {
    const response = await axios.get('https://rajaongkir.komerce.id/api/v1/destination/domestic-province', {
      headers: {
        'x-api-key': RAJAONGKIR_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    res.status(200).json(response.data.data || []);
  } catch (error) {
    console.error('Gagal ambil data provinsi:', error.response?.data || error.message);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.response?.data || error.message });
  }
};

// ✅ Get cities by province (fetch from Komerce API)
exports.getCities = async (req, res) => {
  try {
    const { province_id } = req.params;
    if (!province_id) return res.status(400).json({ message: 'province_id diperlukan' });
    const response = await axios.get(`https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?province_id=${province_id}`, {
      headers: {
        'x-api-key': RAJAONGKIR_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    res.status(200).json(response.data.data || []);
  } catch (error) {
    console.error('Gagal ambil data kota:', error.response?.data || error.message);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.response?.data || error.message });
  }
};

// ✅ Calculate shipping cost using Komship Delivery API (RajaOngkir)
exports.calculateShipping = async (req, res) => {
  try {
    const { shipper_destination_id, receiver_destination_id, weight, item_value, cod, origin_pin_point, destination_pin_point } = req.query;
    if (!shipper_destination_id || !receiver_destination_id || !weight || !item_value) {
      return res.status(400).json({ message: 'Missing required parameters: shipper_destination_id, receiver_destination_id, weight, and item_value are required.' });
    }
    const data = await calculateShipping({ shipper_destination_id, receiver_destination_id, weight, item_value, cod, origin_pin_point, destination_pin_point });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error calculating shipping.', error: err });
  }
};

// ✅ Get available couriers
exports.getCouriers = async (req, res) => {
  try {
    const couriers = [
      { code: 'jne', name: 'JNE' },
      { code: 'sicepat', name: 'SiCepat' },
      { code: 'ide', name: 'ID Express' },
      { code: 'sap', name: 'SAP Express' },
      { code: 'jnt', name: 'J&T Express' },
      { code: 'ninja', name: 'Ninja Express' },
      { code: 'tiki', name: 'TIKI' },
      { code: 'lion', name: 'Lion Parcel' },
      { code: 'anteraja', name: 'AnterAja' },
      { code: 'pos', name: 'POS Indonesia' },
      { code: 'ncs', name: 'NCS' },
      { code: 'rex', name: 'REX Express' },
      { code: 'rpx', name: 'RPX Express' },
      { code: 'sentral', name: 'Sentral Cargo' },
      { code: 'star', name: 'Star Cargo' },
      { code: 'wahana', name: 'Wahana Express' },
      { code: 'dse', name: 'DSE Express' }
    ];

    res.status(200).json(couriers);
  } catch (error) {
    console.error('Gagal ambil data kurir:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ✅ Get shipping cost for cart
exports.getShippingCostForCart = async (req, res) => {
  try {
    const { origin, destination, courier } = req.body;
    const user_id = req.user?._id || req.body.user_id;

    if (!origin || !destination || !courier || !user_id) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    // Get cart items to calculate total weight
    const Cart = require('../models/cart/Cart');
    const cart = await Cart.findOne({ user_id }).populate('cart_item.product_id');
    
    if (!cart || cart.cart_item.length === 0) {
      return res.status(400).json({ message: 'Keranjang kosong' });
    }

    // Calculate total weight (assuming each product has weight in grams)
    const totalWeight = cart.cart_item.reduce((sum, item) => {
      const productWeight = item.product_id.weight || 500; // default 500g if no weight
      return sum + (productWeight * item.jumlah);
    }, 0);

    // Minimum weight is 1kg (1000g)
    const weight = Math.max(totalWeight, 1000);

    try {
      const response = await axios.post(`${RAJAONGKIR_BASE_URL}/calculate/domestic-cost`, {
        origin: origin,
        destination: destination,
        weight: weight,
        courier: courier,
        price: 'lowest'
      }, {
        headers: {
          'x-api-key': RAJAONGKIR_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      // Transform RajaOngkir Komerce response to match expected format
      const shippingOptions = response.data.data?.map(item => ({
        service: item.service,
        cost: [{
          value: item.price,
          etd: item.etd || '1-3'
        }]
      })) || [];

      res.status(200).json({
        weight: weight,
        shipping_options: shippingOptions
      });
    } catch (apiError) {
      console.error('RajaOngkir API error:', apiError.response?.data || apiError.message);
      // Tidak ada lagi mock data, langsung return error
      return res.status(500).json({ message: 'Gagal mengambil ongkir dari API', error: apiError.response?.data || apiError.message });
    }
  } catch (error) {
    console.error('Gagal hitung ongkir untuk keranjang:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.searchDestination = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword || keyword.length < 3) {
      return res.status(400).json({ message: 'Keyword must be at least 3 characters.' });
    }
    const data = await searchDestination(keyword);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error searching destination.', error: err });
  }
}; 