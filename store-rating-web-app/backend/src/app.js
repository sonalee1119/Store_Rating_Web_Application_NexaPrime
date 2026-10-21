import { env } from './config/env.js';
import {
  createApp,
  corsMiddleware,
  jsonMiddleware
} from './utils/httpAdapter.js';
import { isMongoConnected } from './services/dataStore.js';
import authRoutes from './routes/authRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = createApp();

app.use(
  corsMiddleware({
    origin: env.CLIENT_ORIGIN ? env.CLIENT_ORIGIN.split(',') : true,
    credentials: true
  })
);
app.use(jsonMiddleware({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'nexaprime-store-rating-api',
    storage: isMongoConnected() ? 'mongodb' : 'local_json_fallback',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/owner', ownerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
