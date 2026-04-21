require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const connectDB = require('./config/database');
const { initSocket } = require('./config/Socket');
const { initJobs } = require('./Jobs/Index');
const routes = require('./routes/Index');
const errorMiddleware = require('./middleware/Error.middleware');
const logger = require('./utils/Logger');

const app = express();
const server = http.createServer(app);

connectDB();
initSocket(server);



app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter(Boolean);

    // Autorise les requêtes sans origin (Postman, mobile, etc.)
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqué pour : ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));



app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'University Management API', version: '1.0.0' },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}/api` }],
    components: {
      securitySchemes: { BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./routes/*.js', './models/*.js'],
};
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

app.use('/api', routes);
app.use('/uploads', express.static('uploads'));

// Gestion erreurs (errorMiddleware gère tout)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Serveur démarré sur le port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  logger.info(`📚 Swagger : http://localhost:${PORT}/api/docs`);
  if (process.env.NODE_ENV !== 'test') initJobs();
});

const shutdown = (signal) => {
  logger.info(`[${signal}] Arrêt propre...`);
  server.close(() => { logger.info('✅ Serveur fermé'); process.exit(0); });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => logger.error(`Unhandled Rejection: ${reason}`));
process.on('uncaughtException', (err) => { logger.error(`Uncaught Exception: ${err.message}`); process.exit(1); });

module.exports = { app, server };