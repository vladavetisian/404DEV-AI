export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const host = req.headers.host;
  const redirectUri = `https://${host}/api/github-callback`;
  const scope = 'repo user';
  
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
  
  res.redirect(githubUrl);
}
