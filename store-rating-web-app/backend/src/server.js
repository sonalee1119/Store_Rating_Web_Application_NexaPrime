import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';

async function startServer() {
  const dbStatus = await connectDB();
  app.listen(env.PORT, () => {
    console.log(
      `Store Rating API listening on http://localhost:${env.PORT} (storage: ${dbStatus.mode})`
    );
  });
}

startServer().catch(error => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});
