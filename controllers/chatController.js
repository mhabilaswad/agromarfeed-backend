// controllers/chatController.js
require("dotenv").config();
const axios = require("axios");
const Product = require("../models/product/Product");
const fs = require('fs');
const path = require('path');

exports.handleChat = async (req, res) => {
  const { userMessage } = req.body;

  try {
    // Improved product detection with more specific keywords
    const productKeywords = {
      // Direct product requests
      direct: ['produk', 'pakan', 'rekomendasi', 'saran', 'cari', 'temukan', 'butuh', 'ingin beli', 'mau beli', 'beli'],
      
      // Animal types
      animals: ['ayam', 'bebek', 'sapi', 'kambing', 'domba', 'ikan', 'lele', 'gurame', 'nila', 'udang', 'ternak', 'unggas'],
      
      // Product categories
      categories: ['ruminansia', 'non-ruminansia', 'akuakultur', 'pelet', 'fermentasi', 'serbuk', 'granul'],
      
      // Specific needs
      needs: ['pertumbuhan', 'gemuk', 'sehat', 'produksi telur', 'daging', 'susu', 'pemeliharaan'],
      
      // Price and budget
      price: ['harga', 'murah', 'mahal', 'budget', 'hemat', 'efisien', 'biaya'],
      
      // Quality and performance
      quality: ['bagus', 'terbaik', 'berkualitas', 'premium', 'standar', 'hasil', 'efektif']
    };

    // Check if user is asking for product recommendations with more sophisticated logic
    const userMessageLower = userMessage.toLowerCase();
    
    // Check for direct product requests
    const hasDirectRequest = productKeywords.direct.some(keyword => 
      userMessageLower.includes(keyword)
    );
    
    // Check for animal mentions
    const hasAnimalMention = productKeywords.animals.some(keyword => 
      userMessageLower.includes(keyword)
    );
    
    // Check for category mentions
    const hasCategoryMention = productKeywords.categories.some(keyword => 
      userMessageLower.includes(keyword)
    );
    
    // Check for specific needs
    const hasSpecificNeed = productKeywords.needs.some(keyword => 
      userMessageLower.includes(keyword)
    );
    
    // Check for price-related queries
    const hasPriceQuery = productKeywords.price.some(keyword => 
      userMessageLower.includes(keyword)
    );

    // Determine if this is a product request
    const isProductRequest = hasDirectRequest || 
                           (hasAnimalMention && (hasSpecificNeed || hasCategoryMention)) ||
                           (hasCategoryMention && hasSpecificNeed) ||
                           (hasPriceQuery && hasAnimalMention);

    let products = [];
    let productContext = "";
    
    if (isProductRequest) {
      // Build more sophisticated search query
      const searchTerms = [];
      
      // Extract animal types mentioned
      const mentionedAnimals = productKeywords.animals.filter(animal => 
        userMessageLower.includes(animal)
      );
      
      // Extract categories mentioned
      const mentionedCategories = productKeywords.categories.filter(category => 
        userMessageLower.includes(category)
      );
      
      // Extract needs mentioned
      const mentionedNeeds = productKeywords.needs.filter(need => 
        userMessageLower.includes(need)
      );

      // Build search query based on context
      let query = {};
      
      if (mentionedAnimals.length > 0 || mentionedCategories.length > 0) {
        // Search by category and animal type
        const categoryQueries = [];
        
        if (mentionedAnimals.includes('ayam') || mentionedAnimals.includes('bebek') || mentionedAnimals.includes('unggas')) {
          categoryQueries.push({ categoryOptions: { $regex: 'non-ruminansia', $options: 'i' } });
        }
        
        if (mentionedAnimals.includes('sapi') || mentionedAnimals.includes('kambing') || mentionedAnimals.includes('domba')) {
          categoryQueries.push({ categoryOptions: { $regex: 'ruminansia', $options: 'i' } });
        }
        
        if (mentionedAnimals.includes('ikan') || mentionedAnimals.includes('lele') || mentionedAnimals.includes('gurame') || 
            mentionedAnimals.includes('nila') || mentionedAnimals.includes('udang')) {
          categoryQueries.push({ categoryOptions: { $regex: 'akuakultur', $options: 'i' } });
        }
        
        if (mentionedCategories.length > 0) {
          mentionedCategories.forEach(category => {
            categoryQueries.push({ 
              $or: [
                { categoryOptions: { $regex: category, $options: 'i' } },
                { fisikOptions: { $regex: category, $options: 'i' } }
              ]
            });
          });
        }
        
        if (categoryQueries.length > 0) {
          query.$or = categoryQueries;
        }
      } else {
        // General search in name, description, and categories
        const generalTerms = userMessageLower.split(' ').filter(word => word.length > 2);
        if (generalTerms.length > 0) {
          query.$or = [
            { name: { $regex: generalTerms.join('|'), $options: 'i' } },
            { description: { $regex: generalTerms.join('|'), $options: 'i' } },
            { categoryOptions: { $regex: generalTerms.join('|'), $options: 'i' } },
            { limbahOptions: { $regex: generalTerms.join('|'), $options: 'i' } },
            { fisikOptions: { $regex: generalTerms.join('|'), $options: 'i' } }
          ];
        }
      }
      
      // Execute search
      if (Object.keys(query).length > 0) {
        products = await Product.find(query).limit(3);
      }
      
      // Build context for AI
      if (products.length > 0) {
        const animalContext = mentionedAnimals.length > 0 ? `untuk ${mentionedAnimals.join(', ')}` : '';
        const needContext = mentionedNeeds.length > 0 ? `dengan fokus pada ${mentionedNeeds.join(', ')}` : '';
        const priceContext = hasPriceQuery ? 'dengan pertimbangan harga yang sesuai' : '';
        
        productContext = `Saya menemukan ${products.length} produk yang mungkin sesuai dengan permintaan Anda${animalContext}${needContext}${priceContext}. Berikut adalah rekomendasi produk:`;
        
        // Add detailed product information for AI context
        const productDetails = products.map(product => `
Produk: ${product.name}
Kategori: ${product.categoryOptions}
Bentuk Fisik: ${product.fisikOptions}
Bahan Dasar: ${product.limbahOptions}
Harga: Rp${product.price.toLocaleString()}
Stok: ${product.stock}
Rating: ${product.rating || 0}/5
Deskripsi: ${product.description}
Varian Berat & Harga: ${product.weights.map(w => `${w.value}: Rp${w.price.toLocaleString()}`).join(', ')}
        `).join('\n');
        
        productContext += `\n\n**DETAIL PRODUK YANG TERSEDIA:**\n${productDetails}`;
      } else if (isProductRequest) {
        // No products found but user asked for products
        const animalContext = mentionedAnimals.length > 0 ? `untuk ${mentionedAnimals.join(', ')}` : '';
        const needContext = mentionedNeeds.length > 0 ? `dengan kebutuhan ${mentionedNeeds.join(', ')}` : '';
        const categoryContext = mentionedCategories.length > 0 ? `dalam kategori ${mentionedCategories.join(', ')}` : '';
        
        productContext = `Maaf, saat ini belum ada produk yang tersedia${animalContext}${needContext}${categoryContext} di toko AgroMarFeed. Silakan coba kata kunci lain atau lihat produk yang tersedia di katalog kami.`;
      }
    }

    // Enhanced system prompt based on context
    let systemPrompt = `Kamu adalah AgroMarFeed AI yang membantu pengguna dengan pertanyaan seputar pakan ternak, pertanian, dan peternakan. 

${isProductRequest ? `
**KONTEKS PRODUK:** ${productContext}

**PANDUAN UNTUK REKOMENDASI PRODUK:**
- HANYA berikan informasi tentang produk yang ada dalam database (yang akan saya berikan)
- JANGAN memberikan informasi umum tentang pakan yang tidak ada dalam database
- Jika user meminta produk untuk hewan tertentu, jelaskan mengapa produk tersebut cocok berdasarkan deskripsi produk yang ada
- Jika user membahas kebutuhan spesifik (pertumbuhan, kesehatan, dll), hubungkan dengan manfaat produk berdasarkan deskripsi yang ada
- Jika user membahas harga, berikan konteks nilai ekonomis produk berdasarkan harga yang ada
- Jelaskan keunggulan produk berdasarkan deskripsi yang tersedia
- Berikan tips penggunaan berdasarkan informasi yang ada di deskripsi produk
- Jika tidak ada produk yang cocok dalam database, katakan dengan jujur bahwa produk tersebut belum tersedia di toko kami dan sarankan untuk melihat katalog produk yang tersedia

**PENTING:** Semua informasi yang kamu berikan HARUS berdasarkan data produk yang ada dalam database, bukan pengetahuan umum tentang pakan ternak.
` : `
**PANDUAN UMUM:**
- Berikan jawaban yang informatif dan membantu
- Gunakan bahasa yang mudah dipahami petani dan peternak
- Jika user bertanya tentang cara penggunaan pakan, jelaskan berdasarkan informasi yang tersedia
- Jika user bertanya tentang manfaat, jelaskan berdasarkan deskripsi produk yang ada
- Jika user bertanya tentang komposisi, jelaskan berdasarkan informasi yang tersedia
- Jika user bertanya tentang perbandingan, berikan analisis yang objektif berdasarkan data yang ada
- JANGAN memberikan informasi umum yang tidak ada dalam database produk kami
- Jika user bertanya tentang produk yang tidak ada di database, sarankan untuk melihat katalog produk yang tersedia
`}

Jawab dengan bahasa Indonesia yang sopan, informatif, dan HANYA berdasarkan data produk yang tersedia di database AgroMarFeed.`;

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

exports.handleEnhanceImage = async (req, res) => {
  try {
    const file = req.file;
    const { name, description } = req.body;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!name || !description) {
      return res.status(400).json({ error: 'Nama produk dan deskripsi wajib diisi untuk AI Edit.' });
    }

    // 1. Validate product type using OpenAI
    const validationPrompt = `Apakah produk berikut ini merupakan produk pakan ternak yang benar-benar berbasis limbah pertanian atau limbah kelautan (bukan pakan komersial biasa, bukan makanan manusia, bukan produk olahan lain)?

Nama Produk: ${name}
Deskripsi Produk: ${description}

Jawab hanya dengan salah satu kata berikut: "YA" jika benar produk limbah pertanian/kelautan untuk pakan ternak, atau "TIDAK" jika bukan.`;
    const validationRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Kamu adalah asisten validasi produk pakan limbah.' },
          { role: 'user', content: validationPrompt },
        ],
        max_tokens: 5,
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const validationText = validationRes.data.choices?.[0]?.message?.content?.trim().toUpperCase();
    if (!validationText || !validationText.startsWith('YA')) {
      return res.status(400).json({ error: 'Produk tidak sesuai ketentuan. Hanya produk pakan limbah pertanian atau kelautan yang diperbolehkan.' });
    }

    // Prompt with product name and description
    const prompt = `Generate an ultra-realistic product photo for e-commerce with the following detailed requirements:

    - Product Name: ${name}
    - Product Description: ${description}
    
    Requirements:
    1. The product must look like a real physical agricultural/maritime waste-based animal feed (e.g., fermented rice straw, dried seaweed, fish meal, cassava pulp, etc.).
    2. Use textures, colors, and surface details based on real organic agricultural/marine byproducts used in animal feed.
    3. The object must appear natural, clean, and well-processed (e.g., dried, chopped, granulated, or flaked if applicable), similar to real feed products.
    4. The product should be centered and prominently displayed.
    5. Use a flat-lay or front-facing studio shot angle.
    6. The background must be 100% pure white — no shadows, gradients, or reflections.
    7. The lighting must be even and professional, with no harsh shadows.
    8. Make the result look attractive, trustworthy, and highly suitable for an online product catalog on an e-commerce website.
    9. Emphasize organic, sustainable, and eco-friendly impression without adding unnecessary labels or icons.
    
    Output must be a high-quality, photorealistic image that can be used as the main photo on a product page for an e-commerce platform selling animal feed made from agricultural and maritime waste materials.`;
    
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const imageBase64 = response.data.data?.[0]?.b64_json;
    if (imageBase64) {
      return res.status(200).json({ image: imageBase64 });
    } else {
      return res.status(500).json({ error: 'No image generated', openai: response.data });
    }
  } catch (error) {
    console.error('Enhance Image API error:', error.message, error.response?.data);
    res.status(500).json({ error: 'Failed to enhance image', details: error.message, openai: error.response?.data });
  }
};
