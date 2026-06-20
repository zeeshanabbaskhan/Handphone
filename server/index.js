require('./loadEnv');

const createApp = require('./app');

const port = parseInt(process.env.PORT, 10) || 5001;

const app = createApp();

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
