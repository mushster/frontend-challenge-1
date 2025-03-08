import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { mrfRoutes } from './routes/mrf';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import fs from 'fs';

// Ensure data directory exists
const dataDir = './data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Routes
app.route('/api', mrfRoutes);

// Serve static files from the data directory
app.use('/data/*', serveStatic({ root: './' }));

// Error handling
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// Start server
const port = process.env.PORT || 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port)
});

export default app; 