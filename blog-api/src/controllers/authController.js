const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Create a signed JWT. Structure: header.payload.signature
function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    // Hash the password with bcrypt (10 salt rounds). We NEVER store the plain password.
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    const user = result.rows[0];
    res.status(201).json({ success: true, data: { user, token: signToken(user) } });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
      [email]
    );
    const row = result.rows[0];

    // Same message for "no such user" and "wrong password" so attackers cannot guess which emails exist.
    const ok = row && (await bcrypt.compare(password, row.password_hash));
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = { id: row.id, name: row.name, email: row.email, created_at: row.created_at };
    res.status(200).json({ success: true, data: { user, token: signToken(user) } });
  } catch (err) {
    next(err);
  }
};
