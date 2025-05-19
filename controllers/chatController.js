// controllers/chatController.js
require("dotenv").config();
const axios = require("axios");

exports.handleChat = async (req, res) => {
  const { userMessage } = req.body;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.3-8b-instruct:free",
        messages: [
          {
            role: "system",
            content:
              "Acting as an AI Chatbot from the AgroMarFeed website, you are asked to answer questions from this user using the languages user use. You are only allowed to answer questions about animal feed from agricultural waste and marine waste (that we sell). If the question is not about it, say that you are not trained for that.",
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
          "HTTP-Referer": "https://your-vercel-site.vercel.app", // opsional
          "X-Title": "AgroMarFeed Chatbot",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Chat API error:", error.message);
    res.status(500).json({ error: "Failed to fetch AI response" });
  }
};
