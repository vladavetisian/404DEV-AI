export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send('Missing authorization code.');
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.access_token) {
      res.setHeader(
        'Set-Cookie',
        'github_token=' + tokenData.access_token + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600'
      );
      
      let redirectTo = '/?deploy=true';
      if (state && state.length > 0) {
        redirectTo = '/?deploy=true&data=' + encodeURIComponent(state);
      }
      
      return res.redirect(redirectTo);
    } else {
      return res.status(400).send('GitHub auth failed.');
    }
  } catch (err) {
    return res.status(500).send('Auth server error.');
  }
}
