const autoBind = require('auto-bind');

class UsersHandler {
  constructor(service, validatio) {
    this._service = service;
    this._validatio = validatio;

    autoBind(this);
  }

  async postUserHandler(request, h) {
    this._validatio.validateUsersPayload(request.payload);
    const { username, password, fullname } = request.payload;

    const userId = await this._service.addUser({ username, password, fullname });

    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }

  async getUserByIdHandler(request, h) {
    const { id } = request.params;
    const user = await this._service.getUserById(id);

    const response = h.response({
      status: 'success',
      data: {
        user,
      },
    });
    response.code(200);
    return response;
  }

  async getUsersByUsernameHandler(request, h) {
    const { username = '' } = request.query;
    const users = await this._service.getUsersByUsername(username);

    const response = h.response({
      status: 'success',
      data: {
        users,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = UsersHandler;
