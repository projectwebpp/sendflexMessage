require('dotenv/config')
const express = require('express')
const cors = require('cors')
const { notFound, errorHandler } = require('./middlewares/errorMiddleware')

const app = express()

app.use(cors())
app.use(express.json())

// Task routes will be mounted here in plan 01-02:
// app.use('/tasks', require('./routes/taskRoutes'))

app.use(notFound)
app.use(errorHandler)

module.exports = app
