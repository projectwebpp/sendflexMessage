exports.validateCreateTask = (body) => {
  const errors = []
  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    errors.push('title is required and must be a non-empty string')
  }
  return { valid: errors.length === 0, errors }
}

exports.validateUpdateTask = (body) => {
  const errors = []
  const allowedFields = ['title', 'description', 'status']
  const provided = allowedFields.filter((f) => f in body)
  if (provided.length === 0) errors.push('At least one field (title, description, status) must be provided')
  if ('title' in body && (typeof body.title !== 'string' || body.title.trim() === '')) {
    errors.push('title must be a non-empty string')
  }
  return { valid: errors.length === 0, errors }
}
