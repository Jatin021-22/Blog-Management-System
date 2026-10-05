const pool = require('../config/db');

// Reusable SELECT that joins the author's name onto each post.
const POST_SELECT = `
  SELECT p.id, p.title, p.content, p.category, p.author_id,
         u.name AS author_name, p.created_at, p.updated_at
  FROM posts p
  JOIN users u ON u.id = p.author_id`;

// Make sure :id is a positive integer before it reaches SQL.
function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /api/posts  (public) -> pagination + search + category filter
exports.list = async (req, res, next) => {
  try {
    const { page, limit, search, category } = req.validated.query;
    const offset = (page - 1) * limit;

    // Build the WHERE clause with $n placeholders only. User input is never concatenated into SQL.
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.title ILIKE $${params.length} OR p.content ILIKE $${params.length})`);
    }
    if (category) {
      params.push(category);
      conditions.push(`p.category = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM posts p ${where}`, params);
    const total = countResult.rows[0].total;

    const dataParams = [...params, limit, offset];
    const dataResult = await pool.query(
      `${POST_SELECT} ${where}
       ORDER BY p.created_at DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    );

    res.status(200).json({
      success: true,
      data: dataResult.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/mine  (auth) -> only the logged-in user's posts
exports.mine = async (req, res, next) => {
  try {
    const result = await pool.query(
      `${POST_SELECT} WHERE p.author_id = $1 ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id  (public)
exports.getOne = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid post id' });

    const result = await pool.query(`${POST_SELECT} WHERE p.id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts  (auth) -> author is taken from the TOKEN, never from the request body
exports.create = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    const inserted = await pool.query(
      `INSERT INTO posts (title, content, category, author_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [title, content, category, req.user.id]
    );
    const result = await pool.query(`${POST_SELECT} WHERE p.id = $1`, [inserted.rows[0].id]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/posts/:id  (auth + owner only)
exports.update = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid post id' });

    const existing = await pool.query('SELECT author_id FROM posts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // AUTHORIZATION: answers "Are you allowed to do this?"
    // The user is already authenticated; now we check they OWN this post.
    if (existing.rows[0].author_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to modify this post' });
    }

    const { title, content, category } = req.body;
    await pool.query(
      `UPDATE posts SET title = $1, content = $2, category = $3, updated_at = NOW()
       WHERE id = $4`,
      [title, content, category, id]
    );
    const result = await pool.query(`${POST_SELECT} WHERE p.id = $1`, [id]);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id  (auth + owner only)
exports.remove = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid post id' });

    const existing = await pool.query('SELECT author_id FROM posts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // AUTHORIZATION check (ownership), same idea as update.
    if (existing.rows[0].author_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this post' });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.status(200).json({ success: true, data: { message: 'Post deleted' } });
  } catch (err) {
    next(err);
  }
};
