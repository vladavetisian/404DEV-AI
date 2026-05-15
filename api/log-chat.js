import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { owner, repo, message, sender } = req.body; // sender: 'user' or 'bot'

    if (!owner || !repo || !message) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const entry = {
      message,
      sender,
      timestamp: Date.now()
    };

    // Push to a list per agent (keep last 1000 messages)
    await kv.lpush(`agent:${owner}:${repo}:messages`, JSON.stringify(entry));
    await kv.ltrim(`agent:${owner}:${repo}:messages`, 0, 999);

    // Increment message count
    await kv.hincrby(`agent:${owner}:${repo}:stats`, 'totalMessages', 1);

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Log failed: ' + err.message });
  }
}
