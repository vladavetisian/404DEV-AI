import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.AIzaSyCja9ncq8bU6pZ0pz_3mYnKur9xgrQElME);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function fetchWebsiteText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': '404DEV-AI/1.0' } });
  if (!res.ok) throw new Error(`Failed to fetch URL (${res.status})`);
  const html = await res.text();
  const cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000);
  return cleaned;
}

const SYSTEM_PROMPT = `You are an AI business analyst. You are given the extracted text content of a business website and the industry it operates in. 
Analyze the website and recommend the 2-3 most suitable AI agent types for this specific business. 
The possible AI agent types are: Voice Agent, Appointment Booking Bot, Lead Capture Chatbot, FAQ Chatbot, Follow-up Automation Agent, Sales Qualifier Bot.

Return ONLY a JSON array, no other text. Each object must have exactly these fields:
- agentType: string
- whyFits: string (1-2 sentences)
- problemSolved: string
- estimatedImpact: string`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, industry } = req.body;
    if (!url || !industry) {
      return res.status(400).json({ error: 'URL and industry required.' });
    }

    let content;
    try {
      content = await fetchWebsiteText(url);
    } catch (err) {
      return res.status(400).json({ error: `Could not fetch website: ${err.message}` });
    }

    const prompt = `${SYSTEM_PROMPT}\n\nIndustry: ${industry}\nWebsite content: ${content}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      const jsonMatch = responseText.match(/```json([\s\S]*?)```/) || [null, responseText];
      const cleanJson = (jsonMatch[1] || responseText).trim();
      const recommendations = JSON.parse(cleanJson);
      res.status(200).json({ recommendations: Array.isArray(recommendations) ? recommendations : [] });
    } catch {
      res.status(200).json({ rawResponse: responseText });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
