const qs = require('querystring');
const userModel = require('./models/userModel');
const articleModel = require('./models/articleModel');
const commentModel = require('./models/commentModel');
const notificationModel = require('./models/notificationModel');
const sendRes = require('./lib/sendRes');
const { validateReqHeaders, validateReqLength, validateReqParams } = require('./lib/validators');
const smartErrorHandler = require('./lib/smartErrorHandler');

/**
 * Parse data from request object and validate its content
 * @param { Object } req
 * @return { Promise }
 */
function parseReqData(req) {
    let body = '';

    return new Promise((resolve, reject) => {
        req.on('data', (data) => {
            body += data;

            const reqTooBigErr = validateReqLength(body);

            if (reqTooBigErr) reject(reqTooBigErr);
        });

        req.on('end', () => {
            const post = qs.parse(body);
            const missingParamErr = validateReqParams(post);

            if (missingParamErr) {
                reject(missingParamErr);
                return;
            }

            resolve({
                ...post,
                notify: !(typeof post.notify !== 'undefined' && (!post.notify || post.notify === 'false')),
                ip: req.connection.remoteAddress
            });
        });
    });
}

/**
 * Save comment infos in their respective tables
 * @param { Object } param
 * @param { String } param.slug
 * @param { String } param.parent_id
 * @param { String } param.name
 * @param { String } param.email
 * @param { String } param.ip
 * @param { String } param.comment
 * @param { String } [param.notify]
 */
function saveComment({ slug, parent_id, name, email, ip, comment, notify }) { // eslint-disable-line
    return userModel.save(name, email)
    .then((userId) => { // eslint-disable-line
        return articleModel.save(slug)
        .then((articleId) => { // eslint-disable-line
            return notificationModel.save(userId, articleId, notify)
            .then(() => commentModel.save(articleId, userId, ip, comment, parent_id));
        });
    });
}

/**
 * Manage new comment
 * Parse the comment, save it to DB and re-generate cache files
 * @param { Object } req
 * @param { Object } res
 */
function handleComment(req, res) {
    const handleErr = err => smartErrorHandler(err, res);

    try {
        validateReqHeaders(req.headers);

        parseReqData(req)
        .then(saveComment)
        .then(id => sendRes(res, 201, id[0].toString()))
        .catch(handleErr);
    }

    catch (err) {
        handleErr(err);
    }
}

module.exports = handleComment;
