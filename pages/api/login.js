import { serialize } from 'cookie';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { username, password } = req.body;

  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return res.status(500).json({ message: 'Server configuration error.' });
  }


  console.log('\n[Login API Debug] ---------');
  console.log('[Login API Debug] Received username:', username);
  // Avoid logging the raw password, even in dev
  console.log('[Login API Debug] Received password:', "my password");
  console.log('[Login API Debug] ADMIN_USERNAME hash from .env:', ADMIN_USERNAME);
  console.log('[Login API Debug] ADMIN_PASSWORD hash from .env:', ADMIN_PASSWORD);


  const usernameMatches = await bcrypt.compare(username, ADMIN_USERNAME);
  const passwordMatches = await bcrypt.compare(password, ADMIN_PASSWORD);

  if (usernameMatches && passwordMatches) {

    const cookie = serialize('auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 15,
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ message: 'Login successful' });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
}