const autoBind = require('auto-bind');

class UploadsHandler {
  constructor(service, validation) {
    this._service = service;
    this._validation = validation;

    autoBind(this);
  }

  async uploadImageHandler(request, h) {
    const { data } = request.payload;
    this._validation.validateImageHeaders(data.hapi.headers);

    const fileLocation = await this._service.writeFile(data, data.hapi);

    const response = h.response({
      status: 'success',
      data: {
        fileLocation,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
