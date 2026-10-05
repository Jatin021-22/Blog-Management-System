// Central error handler: every error thrown in a route ends up here.
// Never leaks stack traces in production.
module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isProduction = process.env.NODE_ENV === 'production';

  // Invalid JSON body sent by the client
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }

  // Postgres unique violation (e.g. duplicate email)
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Resource already exists' });
  }

  const status = err.status || 500;
  console.error(err);

  res.status(status).json({
    success: false,
    message: status === 500 && isProduction ? 'Internal server error' : err.message || 'Internal server error',
  });
};
