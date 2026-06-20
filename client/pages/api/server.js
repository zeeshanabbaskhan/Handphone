const createApp = require('../../../server/app');

const app = createApp();

module.exports = app;

module.exports.config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
