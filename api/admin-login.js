const { makeToken } = require('../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Fail with a clear message if the required env vars haven't been set in Vercel yet,
  // instead of crashing (which the browser would just see as "could not reach the server").
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SECRET) {
    return res.status(500).json({
      error: 'Server is missing ADMIN_PASSWORD or ADMIN_SECRET. Add both in Vercel → Settings → Environment Variables, then redeploy.'
    });
  }

  const { password } = req.body || {};
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  try {
    return res.status(200).json({ token: makeToken() });
  } catch (err) {
    console.error('Failed to create admin token:', err);
    return res.status(500).json({ error: 'Server error creating session. Check the ADMIN_SECRET value in Vercel.' });
  }
};
