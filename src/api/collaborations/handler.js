const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, notesService, validation) {
    this._collaborationsService = collaborationsService;
    this._notesService = notesService;
    this._validation = validation;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validation.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { noteId, userId } = request.payload;

    await this._notesService.verifyNoteOwner(noteId, credentialId);
    const collaborationId = await this._collaborationsService.addCollaboration(noteId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    this._validation.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { noteId, userId } = request.payload;

    await this._notesService.verifyNoteOwner(noteId, credentialId);
    await this._collaborationsService.deleteCollaboration(noteId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    });
    response.code(200);
    return response;
  }
}

module.exports = CollaborationsHandler;
