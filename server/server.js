require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// app.post("/chat", async (req, res) => {
//   try {
//     const response = await axios.post(
//       "https://openrouter.ai/api/v1/chat/completions",
//       {
//         model: "openai/gpt-3.5-turbo",
//         messages: [
//           { role: "user", content: req.body.message }
//         ],
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//           "Content-Type": "application/json",
//           "HTTP-Referer": "http://localhost:3000",
//           "X-Title": "AI Study App"
//         },
//       }
//     );

//     res.json({
//       reply: response.data.choices[0].message.content
//     });

//   } catch (error) {
//     console.error("🔥 FULL ERROR:", error.response?.data || error.message);
//     res.status(500).json({ reply: "AI Error ❌" });
//   }
// });

let messages = [];

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
          "HTTP-Referer": "http://localhost:3000",
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

app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});