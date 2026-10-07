class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}
class ValidationError extends HttpError {
  constructor(errors, message) {
    const first = Object.values(errors)[0]?.[0] || "The given data was invalid.";
    const count = Object.keys(errors).length;
    super(422, message || (count > 1 ? `${first} (and ${count - 1} more error${count > 2 ? "s" : ""})` : first), { errors });
  }
}
module.exports = { HttpError, ValidationError };
