const sendRes = require('./sendRes');
const logger = require('./logger');

/**
 * Send client err if it's validation error or log if it's a native or low level error
 * @param { Object } err error object
 * @param { Object } res
 */
function smartErrorHandler(err, res) {
    // send errmsg to user if it's a BadRequestError
    if (res && err.name && err.name === 'BadRequestError') {
        sendRes(res, err.httpStatus, err.message);
        return;
    }

    // send http err if res object is provided
    if (res) sendRes(res, 500, 'Server Error');

    // if it's more low level, or if errorField isn't an error's propt
    logger.error(err);
}

module.exports = smartErrorHandler;
