require('dotenv/config')
const express = require('express')
const cors = require('cors')
const { notFound, errorHandler } = require('./middlewares/errorMiddleware')

const app = express()

app.use(cors())
app.use(express.json())

const taskRoutes = require('./routes/taskRoutes')
app.use('/tasks', taskRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
