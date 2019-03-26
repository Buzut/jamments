const config = require('../config');
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

module.exports = { save, getArticleSubscribersInfos };
