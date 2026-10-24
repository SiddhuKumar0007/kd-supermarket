export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let { email, name, avatar, googleId, credential } = req.body || {};

    // Decode Google JWT credential if passed
    if (credential && !email) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          email = payload.email;
          name = payload.name;
          avatar = payload.picture;
          googleId = payload.sub;
        }
      } catch (err) {
        console.warn('Failed to parse Google JWT payload in serverless function:', err);
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'Valid Google account email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ADMIN_EMAILS = ['siddhukumar2006@gmail.com', 'vyapaarwebs@gmail.com'];
    const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
    const defaultAdminName = normalizedEmail === 'vyapaarwebs@gmail.com' ? 'Vyapaar Webs (Store Admin)' : 'Siddhu Kumar (Store Admin)';

    const user = {
      id: isAdmin ? `admin-${normalizedEmail.split('@')[0]}` : `usr-g-${Date.now()}`,
      name: isAdmin ? (name || defaultAdminName) : (name || email.split('@')[0]),
      email: normalizedEmail,
      role: isAdmin ? 'admin' : 'customer',
      phone: '+91 98113 40853',
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
      provider: 'google',
      savedAddresses: []
    };

    return res.status(200).json({
      token: `token-${user.id}-${Date.now()}`,
      user
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
