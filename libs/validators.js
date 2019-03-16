const BadRequestError = require('./badRequestError');

/**
 * Make sure post is urlencoded
 * @param { Object } headers
 * @return { Null | BadRequestError } null if everything's fine, Err otherwise
 */
function validateReqHeaders(headers) {
    if (!headers || !headers['content-type'] || headers['content-type'] !== 'application/x-www-form-urlencoded') {
        throw new BadRequestError('Content-type must be "application/x-www-form-urlencoded"');
    }

    return null;
}

/**
 * Make sure body isn't larger than a MB
 * @param { Stream } body
 * @return { Null | BadRequestError } null if everything's fine, Err otherwise
 */
function validateReqLength(body) {
    // 1e6 ± 1MB
    if (body.length > 1e6) return new BadRequestError('POST content can’t exceed 1MB', 413);
    return null;
}

/**
 * Make sure email looks like an email
 * @param { String }
 * @return { Bool }
 */
function validateEmail(email) {
    const validEmail = new RegExp('^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,6}$', 'i');

    if (validEmail.test(email)) return true;
    return false;
}

/**
 * Verify that no post param is missing
 * @param { Object } post
 * @return { Null | BadRequestError } null if everything's fine, Err otherwise
 */
function validateReqParams(post) {
    if (!post || !post.slug || !post.name || !post.email || !validateEmail(post.email) || !post.comment) {
        return new BadRequestError('Some fields are missing');
    }

    return null;
}

module.exports = {
    validateReqHeaders,
    validateReqLength,
    validateReqParams,
    validateEmail
};
