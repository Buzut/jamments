// add an global bad request error
function BadRequestError(message, httpStatus) {
    this.name = 'BadRequestError';
    this.message = (message || '');
    this.httpStatus = (httpStatus || 400);
}

BadRequestError.prototype = new Error();
BadRequestError.prototype.constructor = BadRequestError;

module.exports = BadRequestError;
