const taskService = require('../services/taskService')
const { validateCreateTask, validateUpdateTask } = require('../validations/taskValidation')
const { success, error } = require('../utils/apiResponse')

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks()
    success(res, tasks, 'Tasks retrieved')
  } catch (err) { next(err) }
}

exports.getTaskById = async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return error(res, 'Invalid task id', 400)
    const task = await taskService.getTaskById(req.params.id)
    if (!task) return error(res, 'Task not found', 404)
    success(res, task, 'Task retrieved')
  } catch (err) { next(err) }
}

exports.createTask = async (req, res, next) => {
  try {
    const { valid, errors } = validateCreateTask(req.body)
    if (!valid) return error(res, errors.join(', '), 400)
    const task = await taskService.createTask(req.body)
    success(res, task, 'Task created', 201)
  } catch (err) { next(err) }
}

exports.updateTask = async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return error(res, 'Invalid task id', 400)
    const { valid, errors } = validateUpdateTask(req.body)
    if (!valid) return error(res, errors.join(', '), 400)
    const task = await taskService.updateTask(req.params.id, req.body)
    if (!task) return error(res, 'Task not found', 404)
    success(res, task, 'Task updated')
  } catch (err) { next(err) }
}

exports.deleteTask = async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return error(res, 'Invalid task id', 400)
    const task = await taskService.deleteTask(req.params.id)
    if (!task) return error(res, 'Task not found', 404)
    success(res, task, 'Task deleted')
  } catch (err) { next(err) }
}
