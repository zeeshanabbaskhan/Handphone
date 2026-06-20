const path = require('path');
const fs = require('fs');

function loadEnvFile(envPath) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  }
}

loadEnvFile(path.join(__dirname, '../.env'));
loadEnvFile(path.join(__dirname, '.env'));

module.exports = {};
