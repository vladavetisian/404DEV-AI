export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.VERCEL_URL || req.headers.host}/api/github-callback`;
  const scope = 'repo user';
  
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  
  res.redirect(githubUrl);
}
