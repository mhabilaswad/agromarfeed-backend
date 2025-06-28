// controllers/chatController.js
require("dotenv").config();
const axios = require("axios");
const Product = require("../models/product/Product");

exports.handleChat = async (req, res) => {
  const { userMessage } = req.body;

  try {
    // Check if user is asking for product recommendations
    const productKeywords = [
      'produk', 'pakan', 'rekomendasi', 'saran', 'cari', 'temukan', 'butuh', 'ingin beli',
      'jenis', 'kategori', 'harga', 'stok', 'tersedia', 'bagus', 'terbaik'
    ];
    
    const isProductRequest = productKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    let products = [];
    if (isProductRequest) {
      // Search products based on user message
      const searchTerms = userMessage.toLowerCase().split(' ');
      const query = {
        $or: [
          { name: { $regex: searchTerms.join('|'), $options: 'i' } },
          { description: { $regex: searchTerms.join('|'), $options: 'i' } },
          { categoryOptions: { $regex: searchTerms.join('|'), $options: 'i' } },
          { limbahOptions: { $regex: searchTerms.join('|'), $options: 'i' } },
          { fisikOptions: { $regex: searchTerms.join('|'), $options: 'i' } }
        ]
      };
      
      products = await Product.find(query).limit(3);
    }

    const systemPrompt = `Kamu adalah AgroMarFeed AI yang membantu pengguna dengan pertanyaan seputar pakan ternak, pertanian, dan peternakan. Berikan jawaban yang informatif dan membantu.

Jika user meminta informasi tentang produk, maka kamu harus memberikan informasi tentang produk tersebut.
Jika user meminta informasi tentang harga, maka kamu harus memberikan informasi tentang harga produk tersebut.
Jika user meminta informasi tentang cara penggunaan, maka kamu harus memberikan informasi tentang cara penggunaan produk tersebut.
Jika user meminta informasi tentang manfaat, maka kamu harus memberikan informasi tentang manfaat produk tersebut.
Jika user meminta informasi tentang komposisi, maka kamu harus memberikan informasi tentang komposisi produk tersebut.
Jika user meminta informasi tentang kandungan nutrisi, maka kamu harus memberikan informasi tentang kandungan nutrisi produk tersebut.

${products.length > 0 ? `Saya menemukan ${products.length} produk yang mungkin sesuai dengan permintaan Anda. Berikut adalah rekomendasi produk:` : ''}

Jawab dengan bahasa Indonesia yang sopan dan informatif.`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Add products to response if found
    const aiResponse = response.data;
    if (products.length > 0) {
      aiResponse.products = products;
    }

    res.status(200).json(aiResponse);
  } catch (error) {
    console.error("Chat API error:", error.message);
    res.status(500).json({ error: "Failed to fetch AI response" });
  }
};

exports.handleReview = async (req, res) => {
  const { description } = req.body;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Kamu adalah AgroMarFeed AI yang ahli dalam review dan perbaikan deskripsi produk pakan ternak. Tugasmu adalah:

1. Review deskripsi produk yang diberikan user
2. Berikan rating: "Kurang Bagus", "Cukup", atau "Sudah Bagus"
3. Berikan alasan kenapa rating tersebut diberikan
4. Berikan saran perbaikan dengan format deskripsi yang lebih informatif dan terstruktur

Format response:
**Rating:** [Kurang Bagus/Cukup/Sudah Bagus]

**Hasil Review:** katakan bahwa pada kalimat atau bagian mana yang kurang cocok, kurang penting, atau kurang menjual

**Saran Perbaikan:**
[Deskripsi yang sudah diperbaiki dengan fokus pada informasi faktual dan manfaat nyata]

Panduan untuk perbaikan deskripsi:
- Fokus pada informasi faktual dan manfaat nyata
- Hindari bahasa marketing yang berlebihan atau hiperbola
- Sertakan informasi komposisi, kandungan nutrisi, dan cara penggunaan
- Jelaskan manfaat konkret untuk ternak/ikan (pertumbuhan, kesehatan, efisiensi)
- Gunakan bahasa yang mudah dipahami petani dan jurgan tambak
- Struktur yang rapi: Komposisi → Manfaat → Cara Penggunaan → Keunggulan
- Sertakan informasi teknis yang relevan (protein, energi, dll)
- Jelaskan target ternak/ikan yang cocok
- Berikan tips penggunaan yang praktis

Contoh struktur yang baik:
- Komposisi bahan baku
- Kandungan nutrisi utama
- Manfaat untuk ternak/ikan
- Cara penggunaan dan dosis
- Target ternak/ikan
- Keunggulan dibanding pakan lain
Namun jangan selalu begitu stukturnya, buat variasi yang berbeda setiap generate.
Jangan terlalu banyak spasi kosong. dan /n berlebih.
Kalau deskripsi yang diberikan bukan merupakan deskripsi produk dari Produk Limbah Pertanian maupun maritim, maka bilang saja Sepertinya itu bukan produk limbah untuk pakan, mohon masukkan deskripsi yang benar. Tapi kalau sudah mendekati (seperti menyebutkan nama hewannya dan limbah) maka tetap jawab saja`.trim(),
          },
          {
            role: "user",
            content: `Review dan perbaiki deskripsi produk ini: ${description}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Review API error:", error.message);
    res.status(500).json({ error: "Failed to fetch AI review" });
  }
};
