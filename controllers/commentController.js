const config = require('../config');
const { sendNewCommentValidationMail } = require('../libs/emailSenders');
const isEmail = require('../libs/isEmail');
const sendRes = require('../libs/sendRes');
const { generateArticleCache } = require('../libs/cacheFilesGenerators');
const smartErrorHandler = require('../libs/smartErrorHandler');
const validateRequest = require('../libs/validateRequest');
const articleModel = require('../models/articleModel');
const commentModel = require('../models/commentModel');
const notificationModel = require('../models/notificationModel');
const userModel = require('../models/userModel');

const userSecretValidator = {
    name: 'user_secret',
    type: 'string',
    validator: v => v.length(18),
    failMsg: 'user_secret should be 18 chars'
};

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
                    commentId,
                    slug
                };
            })
        );
    });
}

/**
 * Manage new comment
 * Parse the comment and save it to DB
 * @param { Object } req
 * @param { Object } res
 */
function addComment(req, res) {
    const paramsValidation = [
        { slug: 'string' },
        { name: 'name', type: 'string', validator: v => v.minLength(3).maxLength(20), failMsg: 'name must be between 3 and 20 chars' }, // eslint-disable-line
        { name: 'email', customValidator: isEmail, failMsg: 'email must be an email string' },
        { name: 'comment', type: 'string', validator: v => v.maxLength(3000), failMsg: 'comment cannot be longer than 3000 chars' }, // eslint-disable-line
        { name: 'parent_id', type: 'integer', coerce: true, optional: true }, // eslint-disable-line
        { name: 'notify', type: 'boolean', optional: true }
    ];

    validateRequest(req, paramsValidation)
    .then(post => saveComment({
        ...post,
        notify: !(typeof post.notify !== 'undefined' && (!post.notify || post.notify === 'false')),
        ip: req.connection.remoteAddress
    }))
    .then((commentValidationParams) => {
        sendRes(res, 201);
        return sendNewCommentValidationMail(commentValidationParams);
    })
    .catch(err => smartErrorHandler(err, res));
}

/**
 * Check if commentId & userSecret match and confirm comment
 * @param { Object } req
 * @param { Object } res
 * @param { String } commentId
 */
function approveComment(req, res, commentId) {
    validateRequest(req, [userSecretValidator])
    .then(post => commentModel.approve(commentId, post.user_secret))
    .then((articleId) => {
        sendRes(res, 204);
        return generateArticleCache(articleId);
    })
    .catch(err => smartErrorHandler(err, res));
}

/**
 * Delete comment if authorized
 * @param { Object } req
 * @param { Object } res
 * @param { String } commentId
 */
function updateComment(req, res, commentId) {
    validateRequest(req, [
        userSecretValidator,
        { name: 'comment', type: 'string', validator: v => v.maxLength(3000), failMsg: 'comment cannot be longer than 3000 chars' }, // eslint-disable-line
    ])
    .then(
        post => userModel.getUserSecret(config.adminEmail)
        .then(adminSecret => commentModel.update(commentId, post.user_secret, adminSecret, post.comment))
    )
    .then((articleId) => {
        sendRes(res, 204);
        return generateArticleCache(articleId);
    })
    .catch(err => smartErrorHandler(err, res));
}

/**
 * Delete comment if authorized
 * @param { Object } req
 * @param { Object } res
 * @param { String } commentId
 */
function deleteComment(req, res, commentId) {
    validateRequest(req, [userSecretValidator])
    .then(
        post => userModel.getUserSecret(config.adminEmail)
        .then(adminSecret => commentModel.erase(commentId, post.user_secret, adminSecret))
    )
    .then((articleId) => {
        sendRes(res, 204);
        return generateArticleCache(articleId);
    })
    .catch(err => smartErrorHandler(err, res));
}

module.exports = {
    addComment,
    approveComment,
    updateComment,
    deleteComment
};
