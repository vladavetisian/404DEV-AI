export default async function handler(req, res) {
  const { code } = req.query;
  
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code
    })
  });
  
  const tokenData = await tokenRes.json();
  
  if (tokenData.access_token) {
    // Store token in a cookie (simple approach — upgrade to DB later)
    res.setHeader('Set-Cookie', `github_token=${tokenData.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`);
    res.redirect('/?deploy=true');
  } else {
    res.status(400).send('GitHub auth failed. Please try again.');
  }
}
