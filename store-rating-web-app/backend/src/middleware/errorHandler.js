export function notFoundHandler(req, res) {
  res.status(404).json({
    message: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}`
  });
}

export function errorHandler(err, _req, res, _next) {
  console.error('API Error:', err?.message || err);
  const status = err?.statusCode || 500;
  res.status(status).json({
    message: err?.message || 'An unexpected server error occurred.'
  });
}
