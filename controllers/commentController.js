const BadRequestError = require('bad-request-error');
const validateMX = require('email-domain-check');
const RequestValidator = require('node-body-validator');
const config = require('../config'); // eslint-disable-line
const { sendNewCommentValidationMail, sendNewCommentNotification } = require('../libs/emailSenders');
const isEmail = require('../libs/isEmail');
const sendRes = require('../libs/sendRes');
const { generateArticleCache } = require('../libs/cacheFilesGenerators');
const handleError = require('../libs/handleError');
const userSecretValidator = require('../libs/userSecretValidator');
const articleModel = require('../models/articleModel');
const commentModel = require('../models/commentModel');
const notificationModel = require('../models/notificationModel');
const userModel = require('../models/userModel');

const reqValidator = new RequestValidator('form');

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

    reqValidator.validate(req, paramsValidation)
    .then(
        post => validateMX(post.email)
        .then((isValid) => {
            if (isValid) return Promise.resolve();
            return Promise.reject(new BadRequestError('Your email seems unreachable'));
        })
        .then(() => saveComment({
            ...post,
            notify: !(typeof post.notify !== 'undefined' && (!post.notify || post.notify === 'false')),
            ip: req.connection.remoteAddress
        }))
    )
    .then((commentValidationParams) => {
        sendRes(res, 201);
        return sendNewCommentValidationMail(commentValidationParams);
    })
    .catch(err => handleError(err, res));
}

/**
 * Check if commentId & userSecret match and confirm comment
 * @param { Object } req
 * @param { Object } res
 * @param { String } commentId
 */
function approveComment(req, res, commentId) {
    reqValidator.validate(req, [userSecretValidator])
    .then(post => commentModel.approve(commentId, post.user_secret))
    .then((articleInfos) => {
        sendRes(res, 204);

        if (!articleInfos) return Promise.resolve();

        return notificationModel.getArticleSubscribersInfos(articleInfos.articleId).then(
            subscribersInfos => Promise.all([
                generateArticleCache(articleInfos.articleId),
                sendNewCommentNotification(subscribersInfos, articleInfos.articleId, articleInfos.slug)
            ])
        );
    })
    .catch(err => handleError(err, res));
}

/**
 * Delete comment if authorized
 * @param { Object } req
 * @param { Object } res
 * @param { String } commentId
 */
function updateComment(req, res, commentId) {
    reqValidator.validate(req, [
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
    .catch(err => handleError(err, res));
}

/**
 * Delete comment if authorized
 * @param { Object } req
 * @param { Object } res
 * @param { String } commentId
 */
function deleteComment(req, res, commentId) {
    reqValidator.validate(req, [userSecretValidator])
    .then(
        post => userModel.getUserSecret(config.adminEmail)
        .then(adminSecret => commentModel.erase(commentId, post.user_secret, adminSecret))
    )
    .then((articleId) => {
        sendRes(res, 204);
        return generateArticleCache(articleId);
    })
    .catch(err => handleError(err, res));
}

module.exports = {
    addComment,
    approveComment,
    updateComment,
    deleteComment
};
