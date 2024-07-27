require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const fs = require('fs');
const path = require('path');

const ClientError = require('./exceptions/ClientError');

// Notes
const notes = require('./api/notes');
const NotesService = require('./services/postgres/NotesService');
const NotesValidation = require('./validation/notes');

// Users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidation = require('./validation/users');

// Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidation = require('./validation/authentications');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidation = require('./validation/collaborations');

// exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidation = require('./validation/exports');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/s3/StorageService');
const UploadsValidation = require('./validation/uploads');

// Cache
const CacheService = require('./services/redis/CacheService');

const init = async () => {
  const cacheService = new CacheService();
  const collaborationsService = new CollaborationsService(cacheService);
  const notesService = new NotesService(collaborationsService, cacheService);
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const storageService = new StorageService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    }
  ]);

  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: notes,
      options: {
        service: notesService,
        validation: NotesValidation,
      }
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validation: UsersValidation,
      }
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validation: AuthenticationsValidation,
      }
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        notesService,
        validation: CollaborationsValidation,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validation: ExportsValidation,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validation: UploadsValidation,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        fs.appendFileSync(
          path.resolve(__dirname, '../src/logs/error.log'),
          `${new Date().toLocaleString()} : ${response.stack}\n`,
          (err) => {
            if (err) {
              console.log(err);
            }
          }
        );
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      fs.appendFileSync(
        path.resolve(__dirname, '../src/logs/error.log'),
        `${new Date().toLocaleString()} : ${response.stack}\n`,
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
      return newResponse;
    }
    return h.continue;
  });

  await server.start();
  fs.writeFileSync(
    path.resolve(__dirname, '../src/logs/app.log'),
    `${new Date().toLocaleString()} : Server berjalan pada ${server.info.uri}\n`
  );
};

init();
