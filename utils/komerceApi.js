const axios = require('axios');

const KOMERCE_API_KEY = process.env.KOMERCE_API_KEY;
const BASE_URL = 'https://api-sandbox.collaborator.komerce.id/tariff/api/v1';

async function searchDestination(keyword) {
  try {
    const res = await axios.get(`${BASE_URL}/destination/search`, {
      params: { keyword },
      headers: { 'x-api-key': KOMERCE_API_KEY },
    });
    return res.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

async function calculateShipping({ shipper_destination_id, receiver_destination_id, weight, item_value, cod, origin_pin_point, destination_pin_point }) {
  try {
    const res = await axios.get(`${BASE_URL}/calculate`, {
      params: {
        shipper_destination_id,
        receiver_destination_id,
        weight,
        item_value,
        cod,
        origin_pin_point,
        destination_pin_point,
      },
      headers: { 'x-api-key': KOMERCE_API_KEY },
    });
    return res.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

module.exports = { searchDestination, calculateShipping }; 