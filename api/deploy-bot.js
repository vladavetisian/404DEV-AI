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
      auto_init: true,
      homepage: `https://${process.env.GITHUB_USERNAME || 'USER'}.github.io/${repoName}`
    })
  });
  return res.json();
}

async function createFile(token, owner, repo, path, content, message) {
  const base64Content = Buffer.from(content).toString('base64');
  
  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
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
}

async function enablePages(token, owner, repo) {
  await fetch(`https://api.github.com/repos/${owner}/${repo}/pages`, {
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
}

function generateBotHTML(agentType, businessName, industry) {
  const botConfig = {
    'Appointment Booking Bot': {
      title: 'Book an Appointment',
      placeholder: 'What day and time works for you?',
      greeting: `Hi! I'm the booking assistant for ${businessName}. When would you like to schedule?`
    },
    'Lead Capture Chatbot': {
      title: 'How Can We Help?',
      placeholder: 'Tell us about your project...',
      greeting: `Welcome to ${businessName}! What brings you here today?`
    },
    'FAQ Chatbot': {
      title: 'Ask Me Anything',
      placeholder: 'Type your question...',
      greeting: `Hi! I can answer questions about ${businessName}. What would you like to know?`
    },
    'Follow-up Automation Agent': {
      title: 'Stay in Touch',
      placeholder: 'Enter your email for updates...',
      greeting: `Thanks for visiting ${businessName}! Want us to follow up with you?`
    },
    'Sales Qualifier Bot': {
      title: 'Find the Right Fit',
      placeholder: 'What are you looking for?',
      greeting: `Hi! Let me help you find the perfect option at ${businessName}. What's your budget?`
    },
    'Voice Agent': {
      title: 'Voice Assistant',
      placeholder: 'Click to speak...',
      greeting: `Hello! I'm the voice assistant for ${businessName}. How can I help?`
    }
  };

  const config = botConfig[agentType] || botConfig['FAQ Chatbot'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title} | ${businessName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0a0a;
      color: #fff;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .chat-container {
      width: 100%;
      max-width: 400px;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .chat-header {
      background: #7C3AED;
      padding: 20px;
      text-align: center;
    }
    .chat-header h1 {
      font-size: 1.3rem;
      font-weight: 600;
    }
    .chat-header p {
      font-size: 0.8rem;
      opacity: 0.8;
      margin-top: 4px;
    }
    .powered-by {
      font-size: 0.7rem;
      opacity: 0.6;
      margin-top: 6px;
    }
    .chat-messages {
      padding: 20px;
      min-height: 300px;
      max-height: 400px;
      overflow-y: auto;
    }
    .message {
      margin-bottom: 15px;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .bot-message {
      background: #27272a;
      padding: 12px 16px;
      border-radius: 12px 12px 12px 4px;
      display: inline-block;
      max-width: 85%;
      font-size: 0.95rem;
      line-height: 1.4;
    }
    .user-message {
      text-align: right;
    }
    .user-message div {
      background: #7C3AED;
      padding: 12px 16px;
      border-radius: 12px 12px 4px 12px;
      display: inline-block;
      max-width: 85%;
      font-size: 0.95rem;
      line-height: 1.4;
    }
    .chat-input {
      padding: 15px;
      border-top: 1px solid #27272a;
      display: flex;
      gap: 10px;
    }
    .chat-input input {
      flex: 1;
      padding: 12px 16px;
      background: #0a0a0a;
      border: 1px solid #27272a;
      border-radius: 25px;
      color: #fff;
      font-size: 0.95rem;
      outline: none;
    }
    .chat-input input:focus {
      border-color: #7C3AED;
    }
    .chat-input button {
      background: #7C3AED;
      border: none;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .chat-input button:hover { background: #6d28d9; }
  </style>
</head>
<body>
  <div class="chat-container">
    <div class="chat-header">
      <h1>${config.title}</h1>
      <p>${businessName}</p>
      <div class="powered-by">Powered by 404DEV AI</div>
    </div>
    <div class="chat-messages" id="messages">
      <div class="message">
        <div class="bot-message">${config.greeting}</div>
      </div>
    </div>
    <div class="chat-input">
      <input type="text" id="userInput" placeholder="${config.placeholder}" autofocus>
      <button onclick="sendMessage()">➤</button>
    </div>
  </div>

  <script>
    const messages = document.getElementById('messages');
    const input = document.getElementById('userInput');

    const responses = {
      'hello': "Hi there! How can I assist you today?",
      'hi': "Hello! What can I help you with?",
      'help': "I'm here to help! Tell me what you're looking for.",
      'price': "We'd love to discuss pricing with you! Please leave your contact info and we'll get back to you.",
      'contact': "You can reach us through this chat, or leave your email and we'll follow up.",
      'appointment': "Great! What day and time works best for you?",
      'book': "I can help you schedule! What service are you interested in?",
      'default': "Thanks for your message! Someone from our team will follow up with you shortly. In the meantime, feel free to ask anything else."
    };

    function sendMessage() {
      const text = input.value.trim();
      if (!text) return;

      // Add user message
      messages.innerHTML += '<div class="message user-message"><div>' + escapeHtml(text) + '</div></div>';

      // Bot thinking
      setTimeout(() => {
        const lowerText = text.toLowerCase();
        let reply = responses.default;
        
        for (const [key, value] of Object.entries(responses)) {
          if (lowerText.includes(key)) {
            reply = value;
            break;
          }
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = req.cookies?.github_token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'GitHub authentication required', authUrl: '/api/github-oauth' });
    }

    const { agentType, businessName, industry, websiteUrl } = req.body;

    if (!agentType || !businessName) {
      return res.status(400).json({ error: 'Agent type and business name required.' });
    }

    // Get GitHub username
    const userRes = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json' }
    });
    const userData = await userRes.json();
    const username = userData.login;

    // Sanitize repo name
    const safeAgentType = agentType.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const safeBusiness = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
    const repoName = `${safeBusiness}-${safeAgentType}`;

    // Create repo
    await createRepo(token, repoName, `AI ${agentType} for ${businessName}`);

    // Wait a moment for repo creation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate bot HTML
    const botHTML = generateBotHTML(agentType, businessName, industry);

    // Create files
    await createFile(token, username, repoName, 'index.html', botHTML, 'Add AI chatbot');
    await createFile(token, username, repoName, 'CNAME', `${username}.github.io`, 'Add CNAME for custom domain (optional)');
    await createFile(token, username, repoName, 'README.md', `# ${agentType} for ${businessName}\n\nAI Agent built with [404DEV AI](https://404dev.ai)\n\nIndustry: ${industry}\nWebsite: ${websiteUrl || 'N/A'}\n\n---\nPowered by 404DEV AI`, 'Add README');

    // Enable GitHub Pages
    await enablePages(token, username, repoName);

    const deployedUrl = `https://${username}.github.io/${repoName}`;

    return res.status(200).json({
      success: true,
      repoUrl: `https://github.com/${username}/${repoName}`,
      deployedUrl: deployedUrl,
      message: `${agentType} deployed successfully! It may take 1-2 minutes for GitHub Pages to publish.`
    });

  } catch (err) {
    console.error('Deploy error:', err);
    return res.status(500).json({ error: `Deployment failed: ${err.message}` });
  }
}
