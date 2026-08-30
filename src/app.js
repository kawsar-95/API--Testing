'use strict';

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/error');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Lightweight request logger for development.
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Blog API is running.',
    docs: 'See /api endpoints below.',
  });
});

app.get('/api', (_req, res) => {
  res.status(200).json({
    message: 'Blog REST API',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login and receive JWT',
      },
      users: {
        'GET /api/users': 'Admin — list all users',
        'GET /api/users/:id': 'Admin — get a specific user',
        'PATCH /api/users/:id/status': 'Admin — activate/deactivate a user',
        'GET /api/users/profile': 'Authenticated — get own profile',
        'PUT /api/users/profile/update': 'Authenticated — update own profile',
        'PATCH /api/users/password': 'Authenticated — update own password',
      },
      blogs: {
        'GET /api/blogs': 'Public — list/search/filter blogs',
        'GET /api/blogs/:id': 'Public — get a specific blog',
        'POST /api/blogs/create': 'Authenticated — create a blog',
        'PUT /api/blogs/update/:id': 'Authenticated — update a blog',
        'DELETE /api/blogs/delete/:id': 'Authenticated — delete a blog',
      },
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
