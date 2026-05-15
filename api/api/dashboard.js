import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = authHeader.slice(7);

  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': '404DEV-AI' }
    });
    if (!userRes.ok) return res.status(401).json({ error: 'Invalid token' });
    const userData = await userRes.json();
    const username = userData.login;

    const agentRepos = await kv.smembers(`user:${username}:agents`);
    const agents = [];

    for (const repo of agentRepos) {
      const info = await kv.hgetall(`agent:${username}:${repo}`);
      const totalMessages = await kv.hget(`agent:${username}:${repo}:stats`, 'totalMessages') || 0;
      agents.push({ repo, ...info, totalMessages: Number(totalMessages) });
    }

    return res.status(200).json({ username, agents });
  } catch (err) {
    return res.status(500).json({ error: 'Dashboard failed: ' + err.message });
  }
}
