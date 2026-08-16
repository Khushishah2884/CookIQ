const express = require('express');
const router = express.Router();

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_INSTRUCTION =
  "You are CookIQ's in-app cooking assistant. Answer questions about recipes, cooking " +
  'techniques, ingredient substitutions, and meal planning. Keep replies concise and format ' +
  'them with Markdown (short paragraphs, **bold** for key terms, bullet or numbered lists for ' +
  'steps/ingredients) so they render cleanly in a chat bubble.';

// POST /api/chat  { message: string }
router.post('/', async (req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'A non-empty "message" field is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in the environment.');
    return res.status(500).json({ message: 'Chat is not configured on the server.' });
  }

  try {
    const geminiRes = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ parts: [{ text: message }] }]
      })
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text().catch(() => '');
      console.error(`Gemini API error: ${geminiRes.status} ${geminiRes.statusText}`, errBody);
      return res.status(502).json({ message: 'The assistant is temporarily unavailable. Please try again.' });
    }

    const data = await geminiRes.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      return res.status(502).json({ message: "Sorry, I couldn't come up with a response. Please try rephrasing." });
    }

    return res.json({ reply });
  } catch (err) {
    console.error('Error calling Gemini API:', err);
    return res.status(500).json({ message: 'Something went wrong while contacting the assistant.' });
  }
});

module.exports = router;
