const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

router
  .route('/')
  .get(taskController.getTasks)
  .post(taskController.createTask);

router
  .route('/:id')
  .put(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
