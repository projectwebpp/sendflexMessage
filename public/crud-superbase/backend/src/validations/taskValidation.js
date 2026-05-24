exports.validateCreateTask = (body) => {
  const errors = []
  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    errors.push('title is required and must be a non-empty string')
  }
  return { valid: errors.length === 0, errors }
}

exports.validateUpdateTask = (body) => {
  const errors = []
  if ('title' in body && (typeof body.title !== 'string' || body.title.trim() === '')) {
    errors.push('title must be a non-empty string')
  }
  return { valid: errors.length === 0, errors }
}
