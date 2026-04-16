require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

let messages = [
  { role: "system", content: "You are a helpful AI study assistant." }
];

app.post("/chat", async (req, res) => {
  try {
    messages.push({ role: "user", content: req.body.message });

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://scintillating-gumption-78e5ee.netlify.app",
          "X-Title": "AI Study App",
        },
      }
    );

    const reply = response.data.choices[0].message.content;

    messages.push({ role: "assistant", content: reply });

    res.json({ reply });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.json({ reply: "Error ❌" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});