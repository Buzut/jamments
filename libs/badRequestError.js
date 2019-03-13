class BadRequestError extends Error {
    constructor(message, httpStatus, ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params);

        this.name = 'BadRequestError';
        this.message = (message || '');
        this.httpStatus = (httpStatus || 400);
    }
}

module.exports = BadRequestError;
