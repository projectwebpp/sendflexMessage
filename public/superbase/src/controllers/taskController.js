const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

function validateCreateTask(body) {
  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    throw new AppError('Title is required and must be a non-empty string', 400);
  }

  return {
    title: body.title.trim(),
    description: body.description ?? null,
    status: typeof body.status === 'boolean' ? body.status : false,
  };
}

function validateUpdateTask(body) {
  const updates = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      throw new AppError('Title must be a non-empty string', 400);
    }
    updates.title = body.title.trim();
  }

  if (body.description !== undefined) {
    updates.description = body.description;
  }

  if (body.status !== undefined) {
    if (typeof body.status !== 'boolean') {
      throw new AppError('Status must be a boolean value', 400);
    }
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('Please provide at least one field to update', 400);
  }

  return updates;
}

async function getTasks(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const task = validateCreateTask(req.body);

    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const updates = validateUpdateTask(req.body);

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      const statusCode = error.code === 'PGRST116' ? 404 : 500;
      throw new AppError(statusCode === 404 ? 'Task not found' : error.message, statusCode);
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      const statusCode = error.code === 'PGRST116' ? 404 : 500;
      throw new AppError(statusCode === 404 ? 'Task not found' : error.message, statusCode);
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
