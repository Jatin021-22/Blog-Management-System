// 404 handler: runs when no route matched the request.
module.exports = function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};
