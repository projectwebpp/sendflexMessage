const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const taskRoutes = require('./routes/taskRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: env.allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Tasks API is running',
  });
});

app.use('/tasks', taskRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
