const config = require('../config'); // eslint-disable-line
const BadRequestError = require('../libs/badRequestError');
const db = require('../libs/connectDb');

/**
 * Get informations on an article's subscribers (user id, name, email, secret)
 * @param { Number } articleId
 * @return { Promise }
 */
function getArticleSubscribersInfos(articleId) {
    return db(config.db.notificationsTable).select(`${config.db.usersTable}.id as user_id`, 'name', 'email', 'secret')
    .innerJoin(config.db.usersTable, `${config.db.usersTable}.id`, 'user_id')
    .where({ article_id: articleId });
}

/**
 * Save user notification preference for an article (if not already set)
 * @param { Array } userId
 * @param { Array } articleId
 * @param { String } notify
 * @return { Promise }
 */
function save(userId, articleId, notify) {
    return db(config.db.notificationsTable).select('id').where({ user_id: userId, article_id: articleId })
    .then((res) => {
        if (res && res.length) return Promise.resolve();
        return db(config.db.notificationsTable).insert({ user_id: userId, article_id: articleId, notify }, 'id');
    });
}

/**
 * Update user notification preference for an article
 * @param { Number } articleId
 * @param { Number } userId
 * @param { String } userSecret
 * @param { Bool } subscribe
 * @return { Promise }
 */
function update(articleId, userId, userSecret, subscribe) {
    return db(config.db.notificationsTable)
    .first(`${config.db.notificationsTable}.id`)
    .innerJoin(config.db.usersTable, `${config.db.usersTable}.id`, 'user_id')
    .where({ article_id: articleId, user_id: userId, secret: userSecret })
    .then((res) => {
        if (!res) return Promise.reject(new BadRequestError('Either comment_id, user_id or user_secret don’t match'));

        return db(config.db.notificationsTable)
        .update('notify', subscribe)
        .innerJoin(config.db.usersTable, `${config.db.usersTable}.id`, 'user_id')
        .where({ article_id: articleId, user_id: userId, secret: userSecret });
    });
}

module.exports = { save, getArticleSubscribersInfos, update };
