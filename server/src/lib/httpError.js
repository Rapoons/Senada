// Error yang boleh ditampilkan ke klien (status + pesan). Selain ini dianggap error server.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}
