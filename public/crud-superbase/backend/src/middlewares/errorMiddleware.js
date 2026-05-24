exports.notFound = (req, res, next) => {
  res.status(404).json({ success: false, data: null, message: `Route not found: ${req.originalUrl}` })
}

exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack)
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500
  res.status(statusCode).json({ success: false, data: null, message: err.message || 'Internal server error' })
}
