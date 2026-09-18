function errorHandler(err, req, res, next) {
  console.error(`[${req.method} ${req.originalUrl}]`, err);
  if (res.headersSent) return next(err);

  const status = Number(err.statusCode) || 500;
  const message =
    status >= 400 && status < 500 && err.message
      ? err.message
      : (err.publicMessage || 'حدث خطأ غير متوقع في الخادم');

  res.status(status).json({ error: message });
}
module.exports = { errorHandler };
