const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { service, validation }) => {
    const exportsHandler = new ExportsHandler(service, validation);
    server.route(routes(exportsHandler));
  },
};
