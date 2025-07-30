import { serialize } from 'cookie';
import { URL } from 'url';

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

  const referer = req.headers.referer || '';
  const refererUrl = new URL(referer, `http://${req.headers.host}`);

  const destination = refererUrl.pathname.startsWith('/admin') ? '/login' : '/';
  res.status(302).setHeader('Location', destination);
  res.end();
}