import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Secure Chatbot Proxy API Route
app.post('/api/chat', async (req, res) => {
  const { messages, provider } = req.body;
  const targetProvider = provider || 'openrouter';

  try {
    if (targetProvider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY || 'AIzaSy...'; // Will use environment variable or fallback placeholder
      const systemMessage = messages.find(m => m.role === 'system');
      const chatMessages = messages.filter(m => m.role !== 'system');

      // Convert messages to Gemini format
      const contents = chatMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const bodyPayload = {
        contents,
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7
        }
      };

      if (systemMessage) {
        bodyPayload.systemInstruction = {
          parts: [{ text: systemMessage.content }]
        };
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، حدث خطأ في معالجة طلبك.';
      return res.json({ response: botResponse });

    } else {
      // Default to OpenRouter
      const apiKey = process.env.OPENROUTER_API_KEY || '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';
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://elbashmohands.dev',
          'X-Title': 'Bashmohandis Education Platform'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: messages,
          max_tokens: 800,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const botResponse = data.choices?.[0]?.message?.content || 'عذراً، حدث خطأ في معالجة طلبك.';
      return res.json({ response: botResponse });
    }
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: error.message || 'Server error occurred' });
  }
});

// Handle React Router - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
