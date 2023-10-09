/* eslint-disable function-paren-newline */
const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, { collaborationsService, notesService, validation }) => {
    const collaborationsHandler = new CollaborationsHandler(
      collaborationsService, notesService, validation
    );
    server.route(routes(collaborationsHandler));
  },
};
