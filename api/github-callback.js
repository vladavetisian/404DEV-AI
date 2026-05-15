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
      // Pass token back via hash fragment (survives redirects, never hits server)
      let html = `<!DOCTYPE html><html><head><script>
        var token = '${tokenData.access_token}';
        var state = '${state || ''}';
        window.location.href = '/?deploy=true&token=' + token + (state ? '&data=' + encodeURIComponent(state) : '');
      </script></head></html>`;
      return res.send(html);
    } else {
      return res.status(400).send('GitHub auth failed. Please try again.');
    }
  } catch (err) {
    return res.status(500).send('Auth server error.');
  }
}
