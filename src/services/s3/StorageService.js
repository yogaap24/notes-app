const Minio = require('minio');

class StorageService {
  constructor() {
    this._client = new Minio.Client({
      endPoint: process.env.MINIO_SERVER,
      port: 9900,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
  }

  async writeFile(file, meta) {
    const bucketName = 'notes-app';
    const objectName = `${+new Date()}-${meta.filename}`;

    try {
      await this._client.putObject(
        bucketName,
        objectName,
        file._data,
        meta.headers['content-type']
      );
      return `http://${process.env.MINIO_SERVER}:${process.env.MINIO_PORT}/${bucketName}/${objectName}`;
    } catch (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }
  }

  async deleteFile(objectName) {
    const bucketName = 'notes-app';
    try {
      await this._client.removeObject(bucketName, objectName);
    } catch (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }
}

module.exports = StorageService;
