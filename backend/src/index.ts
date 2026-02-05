import express from 'express';
import cors from 'cors';
import { appConfig } from './config/config';
import routes from './routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: appConfig.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', routes);

// Start server
app.listen(appConfig.port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${appConfig.port}`);
  console.log(`Environment: ${appConfig.nodeEnv}`);
});
