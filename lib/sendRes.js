/**
 * Send HTTP response as text/plain
 * @param { Object } res
 * @param { Number } statusCode
 * @param { String } msg
 */
function sendRes(res, statusCode, msg) {
    res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
    res.end(msg);
}

module.exports = sendRes;
