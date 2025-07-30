import { serialize } from 'cookie';

export default function handler(req, res) {
  // Expire the cookie by setting maxAge to -1
  const cookie = serialize('auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: -1,
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);

  const destination = '/admin'
  res.status(302).setHeader('Location', destination);
  res.end();
}