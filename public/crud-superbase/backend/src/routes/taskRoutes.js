const { Router } = require('express')
const { getAllTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/taskController')

const router = Router()

router.get('/', getAllTasks)
router.get('/:id', getTaskById)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

module.exports = router
