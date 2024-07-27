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
    const objectName = fileLocation.split('/')[4];

    const response = h.response({
      status: 'success',
      data: {
        fileLocation,
        objectName,
      },
    });
    response.code(201);
    return response;
  }

  async deleteImageHandler(request, h) {
    const { imageName } = request.payload;
    try {
      await this._service.deleteFile(imageName);
      const response = h.response({
        status: 'success',
      });
      response.code(200);
      return response;
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = UploadsHandler;
