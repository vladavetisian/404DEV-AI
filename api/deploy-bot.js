function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length) {
      cookies[name.trim()] = decodeURIComponent(rest.join('=').trim());
    }
  });
  return cookies;
}

async function createRepo(token, repoName, description) {
  const res = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: repoName,
      description: description,
      private: false,
      auto_init: true
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create repo');
  }
  return res.json();
}

async function createFile(token, owner, repo, path, content, message) {
  const base64Content = Buffer.from(content).toString('base64');
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: message,
      content: base64Content,
      branch: 'main'
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create file');
  }
}

async function enablePages(token, owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source: { branch: 'main', path: '/' }
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to enable Pages');
  }
}

function generateBotHTML(agentName, businessName, industry, config = {}) {
  const color = config.color || '#7C3AED';
  const header = config.header || agentName;
  const greeting = config.greeting || `Hi! I'm the ${agentName} for ${businessName}. How can I help you today?`;
  const suggestions = config.suggestions ? config.suggestions.split(',').map(s => s.trim()).filter(Boolean) : ['What services do you offer?', 'How do I book?'];
  const position = config.position || 'bottom-right';
  const size = config.size || 'medium';
  const style = config.style || 'rounded';

  const sizeMap = { small: 320, medium: 400, large: 500 };
  const width = sizeMap[size] || 400;
  const posStyles = position === 'bottom-left'
    ? 'left: 20px; right: auto;'
    : 'right: 20px; left: auto;';

  const borderRadius = style === 'square' ? '4px' : style === 'minimal' ? '8px' : '16px';
  const msgRadius = style === 'square' ? '4px' : style === 'minimal' ? '8px' : '16px';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${header} | ${businessName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: transparent;
      font-family: system-ui, -apple-system, sans-serif;
      overflow: hidden;
    }
    .widget-container {
      position: fixed;
      bottom: 20px;
      ${posStyles}
      width: ${width}px;
      max-height: 600px;
      background: #ffffff;
      border-radius: ${borderRadius};
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      z-index: 9999;
      font-size: 14px;
    }
    .widget-header {
      background: ${color};
      color: white;
      padding: 16px 20px;
      font-weight: 600;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .widget-header .status-dot {
      width: 10px; height: 10px;
      background: #4ade80;
      border-radius: 50%;
      display: inline-block;
    }
    .widget-header small {
      font-weight: 400;
      opacity: 0.8;
      font-size: 11px;
      display: block;
    }
    .widget-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      max-height: 300px;
      background: #f9fafb;
    }
    .message {
      margin-bottom: 12px;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .bot-message {
      background: #f3f4f6;
      color: #1f2937;
      padding: 10px 14px;
      border-radius: ${msgRadius} ${msgRadius} ${msgRadius} 4px;
      display: inline-block;
      max-width: 85%;
      line-height: 1.5;
    }
    .user-message { text-align: right; }
    .user-message div {
      background: ${color};
      color: white;
      padding: 10px 14px;
      border-radius: ${msgRadius} ${msgRadius} 4px ${msgRadius};
      display: inline-block;
      max-width: 85%;
      line-height: 1.5;
    }
    .suggestions {
      padding: 8px 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .suggestion-chip {
      background: white;
      border: 1px solid #d1d5db;
      color: #374151;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .suggestion-chip:hover {
      background: ${color};
      color: white;
      border-color: ${color};
    }
    .widget-input {
      display: flex;
      padding: 12px 16px;
      background: white;
      border-top: 1px solid #e5e7eb;
    }
    .widget-input input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #d1d5db;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
      color: #1f2937;
    }
    .widget-input input:focus { border-color: ${color}; }
    .widget-input button {
      background: ${color};
      border: none;
      width: 40px; height: 40px;
      border-radius: 50%;
      cursor: pointer;
      margin-left: 8px;
      color: white;
      font-size: 18px;
      flex-shrink: 0;
    }
    .widget-input button:hover { opacity: 0.9; }
    .powered-by {
      text-align: center;
      font-size: 10px;
      color: #9ca3af;
      padding: 6px;
      background: #f9fafb;
    }
    .powered-by a { color: #9ca3af; text-decoration: none; }
  </style>
</head>
<body>
  <div class="widget-container">
    <div class="widget-header">
      <span class="status-dot"></span>
      <div>
        ${header}
        <small>${businessName}</small>
      </div>
    </div>
    <div class="suggestions" id="suggestions">
      ${suggestions.map(s => `<span class="suggestion-chip" onclick="sendSuggestion('${s.replace(/'/g, "\\'")}')">${s}</span>`).join('')}
    </div>
    <div class="widget-messages" id="messages">
      <div class="message">
        <div class="bot-message">${greeting}</div>
      </div>
    </div>
    <div class="widget-input">
      <input type="text" id="userInput" placeholder="Type your message..." autofocus>
      <button onclick="sendMessage()">➤</button>
    </div>
    <div class="powered-by">Powered by <a href="https://404devai.vercel.app" target="_blank">404DEV AI</a></div>
  </div>

  <script>
    const messages = document.getElementById('messages');
    const input = document.getElementById('userInput');
    const suggestionsDiv = document.getElementById('suggestions');

    const responses = {
      'hello': "Hi there! How can I assist you today?",
      'hi': "Hello! What can I help you with?",
      'help': "I'm here to help! Tell me what you're looking for.",
      'price': "We'd love to discuss pricing with you! Please leave your contact info and we'll get back to you.",
      'contact': "You can reach us through this chat, or leave your email and we'll follow up.",
      'book': "I can help you schedule! What service are you interested in?",
      'default': "Thanks for your message! Our team will follow up with you shortly. Feel free to ask anything else."
    };

    function sendSuggestion(text) {
      input.value = text;
      sendMessage();
    }

    function sendMessage() {
      const text = input.value.trim();
      if (!text) return;

      messages.innerHTML += '<div class="message user-message"><div>' + escapeHtml(text) + '</div></div>';
      suggestionsDiv.style.display = 'none';

      setTimeout(() => {
        const lowerText = text.toLowerCase();
        let reply = responses.default;
        for (const [key, value] of Object.entries(responses)) {
          if (lowerText.includes(key)) { reply = value; break; }
        }
        messages.innerHTML += '<div class="message"><div class="bot-message">' + reply + '</div></div>';
        messages.scrollTop = messages.scrollHeight;
      }, 600);

      input.value = '';
      messages.scrollTop = messages.scrollHeight;
    }

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const cookies = parseCookies(req.headers.cookie || '');
    const token = cookies.github_token;

    if (!token) {
      const host = req.headers.host;
      return res.status(401).json({
        error: 'GitHub authentication required',
        authUrl: `https://${host}/api/github-oauth`
      });
    }

    const { agentType, businessName, industry, websiteUrl, config } = req.body;

    if (!agentType || !businessName) {
      return res.status(400).json({ error: 'Agent type and business name required.' });
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': '404DEV-AI'
      }
    });

    if (!userRes.ok) {
      return res.status(401).json({
        error: 'Invalid GitHub token.',
        authUrl: `https://${req.headers.host}/api/github-oauth`
      });
    }

    const userData = await userRes.json();
    const username = userData.login;

    const safeName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 25);
    const repoName = `${safeName}-ai-agent`;

    await createRepo(token, repoName, `AI Chat Agent for ${businessName}`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const botHTML = generateBotHTML(agentType, businessName, industry, config);
    await createFile(token, username, repoName, 'index.html', botHTML, 'Add AI chat widget');
    await createFile(token, username, repoName, 'README.md', `# ${agentType} for ${businessName}\n\nAI Chat Widget built with [404DEV AI](https://404devai.vercel.app)\n\nIndustry: ${industry}\nWebsite: ${websiteUrl || 'N/A'}\n\n## How to use\n\nCopy this HTML into your website to embed the chat widget.`, 'Add README');

    await enablePages(token, username, repoName);

    const deployedUrl = `https://${username}.github.io/${repoName}`;

    return res.status(200).json({
      success: true,
      repoUrl: `https://github.com/${username}/${repoName}`,
      deployedUrl: deployedUrl,
      message: 'Agent deployed! May take 1-2 minutes to publish.'
    });

  } catch (err) {
    console.error('Deploy error:', err);
    return res.status(500).json({ error: `Deployment failed: ${err.message}` });
  }
}
