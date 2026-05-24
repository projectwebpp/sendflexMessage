const supabase = require('../config/supabase')

exports.getAllTasks = async () => {
  const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
  if (error) {
    const dbError = new Error('Database operation failed')
    dbError.statusCode = 500
    dbError.internal = error.message
    throw dbError
  }
  return data
}

exports.getTaskById = async (id) => {
  const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single()
  if (error && error.code !== 'PGRST116') {
    const dbError = new Error('Database operation failed')
    dbError.statusCode = 500
    dbError.internal = error.message
    throw dbError
  }
  return data  // null when not found; controller checks this
}

exports.createTask = async ({ title, description, status = false }) => {
  const { data, error } = await supabase.from('tasks').insert([{ title, description, status }]).select().single()
  if (error) {
    const dbError = new Error('Database operation failed')
    dbError.statusCode = 500
    dbError.internal = error.message
    throw dbError
  }
  return data
}

exports.updateTask = async (id, fields) => {
  const { title, description, status } = fields
  const allowed = {}
  if (title !== undefined)       allowed.title = title
  if (description !== undefined) allowed.description = description
  if (status !== undefined)      allowed.status = status

  const { data, error } = await supabase
    .from('tasks').update(allowed).eq('id', id).select().single()
  if (error) {
    const dbError = new Error('Database operation failed')
    dbError.statusCode = 500
    dbError.internal = error.message
    throw dbError
  }
  return data
}

exports.deleteTask = async (id) => {
  const { data, error } = await supabase.from('tasks').delete().eq('id', id).select().single()
  if (error && error.code !== 'PGRST116') {
    const dbError = new Error('Database operation failed')
    dbError.statusCode = 500
    dbError.internal = error.message
    throw dbError
  }
  return data
}
