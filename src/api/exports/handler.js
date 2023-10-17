const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(service, validation) {
    this._service = service;
    this._validation = validation;

    autoBind(this);
  }

  async postExportNotesHandler(request, h) {
    this._validation.validateExportNotesPayload(request.payload);

    const message = {
      userId: request.auth.credentials.id,
      targetEmail: request.payload.targetEmail,
    };
    await this._service.sendMessage('export:notes', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Your request is being processed',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
