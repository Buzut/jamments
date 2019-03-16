const qs = require('querystring');
const getFirstElementIfArray = require('../libs/getFirstElementIfArray');
const { sendNewCommentValidationMail } = require('../libs/emailSenders');
const sendRes = require('../libs/sendRes');
const { generateArticleCache } = require('../libs/cacheFilesGenerators');
const smartErrorHandler = require('../libs/smartErrorHandler');
const { validateReqHeaders, validateReqLength, validateReqParams } = require('../libs/validators');
const articleModel = require('../models/articleModel');
const commentModel = require('../models/commentModel');
const notificationModel = require('../models/notificationModel');
const userModel = require('../models/userModel');

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
    .then(([userId, userName, userEmail, userMd5Email, userSecret]) => { // eslint-disable-line
        return articleModel.save(slug)
        .then(
            articleId => notificationModel.save(userId, articleId, notify)
            .then(() => commentModel.save(articleId, userId, ip, comment, parent_id))
            .then((commentId) => { // eslint-disable-line
                return {
                    userName,
                    userEmail,
                    userMd5Email,
                    userSecret,
                    commentId: getFirstElementIfArray(commentId)
                };
            })
        );
    });
}

/**
 * Manage new comment
 * Parse the comment, save it to DB and re-generate cache files
 * @param { Object } req
 * @param { Object } res
 */
function addComment(req, res) {
    const handleErr = err => smartErrorHandler(err, res);

    try {
        validateReqHeaders(req.headers);

        parseReqData(req)
        .then(
            postData => saveComment(postData)
            .then(
                commentValidationParams => sendRes(res, 201)
                .then(() => sendNewCommentValidationMail(commentValidationParams))
            )
        )
        .catch(handleErr);
    }

    catch (err) {
        handleErr(err);
    }
}

module.exports = { addComment };
