// Generic validation middleware: runs a Joi schema against req.body or req.query.
// If validation fails, respond 400 with a readable message and stop.
module.exports = function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,   // report every problem, not just the first
      stripUnknown: true,  // drop fields we did not ask for
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, ''),
      }));
      return res.status(400).json({
        success: false,
        message: errors[0].message,
        errors,
      });
    }

    if (source === 'body') req.body = value;
    else req.validated = { ...(req.validated || {}), [source]: value };
    next();
  };
};
