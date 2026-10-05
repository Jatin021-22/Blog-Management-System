// AUTHENTICATION middleware: answers "Who are you?"
// It reads the JWT from the Authorization header, verifies the signature,
// and attaches the logged-in user's info to req.user.
const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Send "Authorization: Bearer <token>".' });
  }

  try {
    // jwt.verify checks the signature (made with JWT_SECRET) and the expiry time.
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
