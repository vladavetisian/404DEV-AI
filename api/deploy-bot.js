function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = decodeURIComponent(parts.slice(1).join('=').trim());
    }
  });
  return cookies;
}

async function createRepo(token, repoName, description) {
  const res = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': '404DEV-AI'
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
  const res = await fetch('https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + path, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': '404DEV-AI'
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
  const res = await fetch('https://api.github.com/repos/' + owner + '/' + repo + '/pages', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': '404DEV-AI'
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

function generateBotHTML(agentName, businessName, industry, config) {
  config = config || {};
  const color = config.color || '#7C3AED';
  const header = config.header || agentName;
  const greeting = config.greeting || 'Hi! How can I help you today?';
  const suggestions = config.suggestions ? config.suggestions.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : ['What services do you offer?'];
  const position = config.position || 'bottom-right';
  const size = config.size || 'medium';
  const style = config.style || 'rounded';

  var width = 400;
  if (size === 'small') width = 320;
  if (size === 'large') width = 500;

  var posStyles = 'right: 20px; left: auto;';
  if (position === 'bottom-left') posStyles = 'left: 20px; right: auto;';

  var borderRadius = '16px';
  var msgRadius = '16px';
  if (style === 'square') { borderRadius = '4px'; msgRadius = '4px'; }
  if (style === 'minimal') { borderRadius = '8px'; msgRadius = '8px'; }

  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>' + header + ' | ' + businessName + '</title>\n<style>\n*{margin:0;padding:0;box-sizing:border-box}\nbody{background:transparent;font-family:system-ui,sans-serif;overflow:hidden}\n.widget-container{position:fixed;bottom:20px;' + posStyles + 'width:' + width + 'px;max-height:600px;background:#fff;border-radius:' + borderRadius + ';box-shadow:0 8px 32px rgba(0,0,0,0.15);overflow:hidden;display:flex;flex-direction:column;z-index:9999;font-size:14px}\n.widget-header{background:' + color + ';color:#fff;padding:16px 20px;font-weight:600;font-size:16px;display:flex;align-items:center;gap:10px}\n.widget-header .dot{width:10px;height:10px;background:#4ade80;border-radius:50%}\n.widget-header small{font-weight:400;opacity:0.8;font-size:11px;display:block}\n.widget-messages{flex:1;padding:16px;overflow-y:auto;max-height:300px;background:#f9fafb}\n.message{margin-bottom:12px;animation:fadeIn 0.3s}\n@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}\n.bot-message{background:#f3f4f6;color:#1f2937;padding:10px 14px;border-radius:' + msgRadius + ' ' + msgRadius + ' ' + msgRadius + ' 4px;display:inline-block;max-width:85%;line-height:1.5}\n.user-message{text-align:right}\n.user-message div{background:' + color + ';color:#fff;padding:10px 14px;border-radius:' + msgRadius + ' ' + msgRadius + ' 4px ' + msgRadius + ';display:inline-block;max-width:85%;line-height:1.5}\n.suggestions{padding:8px 16px;display:flex;flex-wrap:wrap;gap:6px;background:#f9fafb;border-top:1px solid #e5e7eb}\n.chip{background:#fff;border:1px solid #d1d5db;color:#374151;padding:6px 12px;border-radius:20px;font-size:12px;cursor:pointer}\n.chip:hover{background:' + color + ';color:#fff;border-color:' + color + '}\n.widget-input{display:flex;padding:12px 16px;background:#fff;border-top:1px solid #e5e7eb}\n.widget-input input{flex:1;padding:10px 14px;border:1px solid #d1d5db;border-radius:24px;font-size:14px;outline:none}\n.widget-input input:focus{border-color:' + color + '}\n.widget-input button{background:' + color + ';border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;margin-left:8px;color:#fff;font-size:18px}\n.powered{text-align:center;font-size:10px;color:#9ca3af;padding:6px;background:#f9fafb}\n</style>\n</head>\n<body>\n<div class="widget-container">\n<div class="widget-header"><span class="dot"></span><div>' + header + '<small>' + businessName + '</small></div></div>\n<div class="suggestions" id="sug">' + suggestions.map(function(s){return '<span class="chip" onclick="sendSug(\'' + s.replace(/'/g,"\\'") + '\')">' + s + '</span>';}).join('') + '</div>\n<div class="widget-messages" id="msgs"><div class="message"><div class="bot-message">' + greeting + '</div></div></div>\n<div class="widget-input"><input id="inp" placeholder="Type your message..." autofocus><button onclick="send()">➤</button></div>\n<div class="powered">Powered by 404DEV AI</div>\n</div>\n<script>\nvar msgs=document.getElementById("msgs"),inp=document.getElementById("inp"),sug=document.getElementById("sug");\nvar r={hello:"Hi there! How can I help?",hi:"Hello! What can I help you with?",help:"I\'m here to help! Tell me what you need.",price:"We\'d love to discuss pricing! Leave your contact info.",contact:"You can reach us here or leave your email.",book:"I can help you schedule! What service?",default:"Thanks! Our team will follow up shortly."};\nfunction sendSug(t){inp.value=t;send()}\nfunction send(){var t=inp.value.trim();if(!t)return;msgs.innerHTML+=\'<div class="message user-message"><div>\'+t+\'</div></div>\';sug.style.display="none";setTimeout(function(){var l=t.toLowerCase(),re=r.default;for(var k in r){if(l.indexOf(k)>=0){re=r[k];break}}msgs.innerHTML+=\'<div class="message"><div class="bot-message">\'+re+\'</div></div>\';msgs.scrollTop=msgs.scrollHeight},600);inp.value="";msgs.scrollTop=msgs.scrollHeight}\ninp.addEventListener("keypress",function(e){if(e.key==="Enter")send()});\n</script>\n</body>\n</html>';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    var cookies = parseCookies(req.headers.cookie || '');
    var token = cookies.github_token;

    if (!token) {
      return res.status(401).json({
        error: 'GitHub authentication required',
        authUrl: 'https://' + req.headers.host + '/api/github-oauth'
      });
    }

    var body = req.body;
    var agentType = body.agentType;
    var businessName = body.businessName;
    var industry = body.industry;
    var websiteUrl = body.websiteUrl;
    var config = body.config;

    if (!agentType || !businessName) {
      return res.status(400).json({ error: 'Agent type and business name required.' });
    }

    var userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'User-Agent': '404DEV-AI'
      }
    });

    if (!userRes.ok) {
      return res.status(401).json({
        error: 'Invalid GitHub token.',
        authUrl: 'https://' + req.headers.host + '/api/github-oauth'
      });
    }

    var userData = await userRes.json();
    var username = userData.login;

    var safeName = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 25);
    var repoName = safeName + '-ai-agent';

    await createRepo(token, repoName, 'AI Chat Agent for ' + businessName);
    await new Promise(function(resolve) { setTimeout(resolve, 2000); });

    var botHTML = generateBotHTML(agentType, businessName, industry, config);
    await createFile(token, username, repoName, 'index.html', botHTML, 'Add AI chat widget');
    await createFile(token, username, repoName, 'README.md', '# ' + agentType + ' for ' + businessName + '\n\nBuilt with 404DEV AI\n\nIndustry: ' + industry, 'Add README');

    await enablePages(token, username, repoName);

    var deployedUrl = 'https://' + username + '.github.io/' + repoName;

    return res.status(200).json({
      success: true,
      repoUrl: 'https://github.com/' + username + '/' + repoName,
      deployedUrl: deployedUrl,
      message: 'Agent deployed! May take 1-2 minutes to publish.'
    });

  } catch (err) {
    console.error('Deploy error:', err);
    return res.status(500).json({ error: 'Deployment failed: ' + err.message });
  }
}
