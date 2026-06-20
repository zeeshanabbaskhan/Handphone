require('../server/loadEnv');

const { execSync } = require('child_process');

execSync('npm run build --prefix client', {
  stdio: 'inherit',
  env: process.env,
});
