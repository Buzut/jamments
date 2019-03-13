const config = require('../config');
const db = require('../libs/connectDb');

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

module.exports = { save };
