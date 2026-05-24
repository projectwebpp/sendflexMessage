const supabase = require('../config/supabase')

exports.getAllTasks = async () => {
  const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

exports.getTaskById = async (id) => {
  const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single()
  if (error) throw new Error(error.message)
  return data
}

exports.createTask = async ({ title, description, status = false }) => {
  const { data, error } = await supabase.from('tasks').insert([{ title, description, status }]).select().single()
  if (error) throw new Error(error.message)
  return data
}

exports.updateTask = async (id, fields) => {
  const { data, error } = await supabase.from('tasks').update(fields).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

exports.deleteTask = async (id) => {
  const { data, error } = await supabase.from('tasks').delete().eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}
