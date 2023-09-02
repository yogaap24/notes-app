const NotesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'notes',
  version: '1.0.0',
  register: async (server, { service, validation }) => {
    const notesHandler = new NotesHandler(service, validation);
    server.route(routes(notesHandler));
  },
};
