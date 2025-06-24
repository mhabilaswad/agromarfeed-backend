// controllers/chatController.js
require("dotenv").config();
const axios = require("axios");

exports.handleChat = async (req, res) => {
  const { userMessage, saldoRekening, mutasiRekening } = req.body;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
        messages: [
          {
            role: "system",
            content: ``.trim(),
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://your-vercel-site.vercel.app",
          "X-Title": "AgroMarFeed Chatbot", // bisa diubah jadi "BankApp Chatbot" misalnya
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Chat API error:", error.message);
    res.status(500).json({ error: "Failed to fetch AI response" });
  }
};
