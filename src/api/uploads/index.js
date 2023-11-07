const UploadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, { service, validation }) => {
    const uploadsHandler = new UploadsHandler(service, validation);
    server.route(routes(uploadsHandler));
  },
};
