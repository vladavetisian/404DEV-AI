export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = 'https://404dev-o0qie7n4d-404-dev-ai-s-projects.vercel.app/api/github-callback';
  const scope = 'repo user';
  
  // Pass deploy data as state
  const state = req.query.data || '';
  
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${encodeURIComponent(state)}`;
  
  res.redirect(githubUrl);
}
