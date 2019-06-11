const RequestValidator = require('node-body-validator');
const config = require('../config'); // eslint-disable-line
const sendRes = require('../libs/sendRes');
const handleError = require('../libs/handleError');
const userSecretValidator = require('../libs/userSecretValidator');
const notificationModel = require('../models/notificationModel');

const reqValidator = new RequestValidator('form');

/**
 * Update user's subscription on an article's comments
 * @param { Object } req
 * @param { Object } res
 * @param { String } articleId
 */
function updateSubscription(req, res, articleId) {
    reqValidator.validate(req, [
        userSecretValidator,
        { user_id: 'String' },
        { name: 'subscribe', type: 'boolean', coerce: true }
    ])
    .then(post => notificationModel.update(articleId, post.user_id, post.user_secret, post.subscribe))
    .then(() => sendRes(res, 204))
    .catch(err => handleError(err, res));
}

module.exports = { updateSubscription };
