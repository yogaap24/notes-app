const UsersHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'users',
  version: '1.0.0',
  register: async (server, { service, validation }) => {
    const usersHandler = new UsersHandler(service, validation);
    server.route(routes(usersHandler));
  },
};
