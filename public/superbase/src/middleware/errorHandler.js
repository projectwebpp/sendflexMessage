function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  console.error(err);

  res.status(statusCode).json({
    success: false,
    status: err.status || 'error',
    message: err.isOperational ? err.message : 'Internal server error',
  });
}

module.exports = errorHandler;
