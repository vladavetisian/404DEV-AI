import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.AIzaSyCja9ncq8bU6pZ0pz_3mYnKur9xgrQElME);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function fetchWebsiteText(url) {
  try {
    const res = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) throw new Error(`Failed to fetch URL (${res.status})`);
    const html = await res.text();
    const cleaned = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000);
    if (!cleaned || cleaned.length < 50) throw new Error('Not enough readable content found on the page');
    return cleaned;
  } catch (err) {
    throw new Error(`Fetch error: ${err.message}`);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, industry } = req.body;

    if (!url || !industry) {
      return res.status(400).json({ error: 'URL and industry required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured on server.' });
    }

    // Fetch the website
    let content;
    try {
      content = await fetchWebsiteText(url);
    } catch (err) {
      return res.status(400).json({ error: `Could not analyze website: ${err.message}` });
    }

    // Build the prompt
    const prompt = `You are an AI business analyst. Given a business website's content and its industry, recommend 2-3 AI agent types for this business.

Industry: ${industry}

Website content: ${content}

Possible agent types: Voice Agent, Appointment Booking Bot, Lead Capture Chatbot, FAQ Chatbot, Follow-up Automation Agent, Sales Qualifier Bot.

Return ONLY a JSON array. No explanations, no markdown. Each object must have:
- agentType
- whyFits
- problemSolved
- estimatedImpact

Example: [{"agentType":"FAQ Chatbot","whyFits":"The site has many services listed with no FAQ section.","problemSolved":"Reduces repetitive customer questions and support tickets.","estimatedImpact":"40% reduction in support inquiries within the first month."}]`;

    // Call Gemini
    let responseText;
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } catch (geminiErr) {
      return res.status(500).json({ error: `AI analysis failed: ${geminiErr.message}` });
    }

    // Parse the response
    try {
      const cleaned = responseText.replace(/```json|```/g, '').trim();
      const recommendations = JSON.parse(cleaned);
      if (!Array.isArray(recommendations) || recommendations.length === 0) {
        return res.status(200).json({ rawResponse: responseText });
      }
      return res.status(200).json({ recommendations });
    } catch {
      return res.status(200).json({ rawResponse: responseText });
    }

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
}
