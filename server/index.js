require('./loadEnv');

const path = require('path');
const createApp = require('./app');

const port = parseInt(process.env.PORT, 10) || 5001;
const dev = process.env.NODE_ENV !== 'production';
const clientDir = path.join(__dirname, '../client');

process.env.API_INTERNAL_URL =
  process.env.API_INTERNAL_URL || `http://127.0.0.1:${port}`;

const next = require(require.resolve('next', { paths: [clientDir] }));
const nextApp = next({ dev, dir: clientDir });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = createApp({ nextHandler: handle });

  app.listen(port, () => {
    console.log(`App running on http://localhost:${port} (${dev ? 'development' : 'production'})`);
  });
}).catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
