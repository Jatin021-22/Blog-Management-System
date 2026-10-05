require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./docs/swagger');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Render/Vercel sit behind a proxy; this makes rate limiting see the real client IP.
app.set('trust proxy', 1);

// Swagger UI needs inline scripts, so it is mounted BEFORE helmet's strict headers.
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Security headers
app.use(helmet());

// CORS: only the frontend origin is allowed (set CLIENT_URL in .env)
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse JSON bodies (limit size to avoid abuse)
app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'Blog API is running. Docs at /docs' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Must be last
app.use(notFound);
app.use(errorHandler);

module.exports = app;
