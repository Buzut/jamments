const config = require('../config');
const db = require('../lib/connectDb');
const BadRequestError = require('../lib/badRequestError');

/**
 * Validate and save comment
 * @param { Array } articleId
 * @param { Array } userId
 * @param { String } ip
 * @param { String } comment
 * @param { String } parentId
 * @return { Promise }
 */
function save(articleId, userId, ip, comment, parentId) {
    const cleandedParentId = parentId ? Number(parentId) : undefined;

    if (parentId && Number.isNaN(cleandedParentId)) {
        return Promise.reject(new BadRequestError('parent_id must be a number'));
    }

    if (parentId && Number.isInteger(cleandedParentId)) {
        return db(config.db.commentsTable).select('id').where({ id: cleandedParentId, article_id: articleId })
        .then((res) => {
            if (!res || !res.length) return Promise.reject(new BadRequestError('parent_id must be a valid article id'));
            return db(config.db.commentsTable).insert({ article_id: articleId, user_id: userId, ip, comment, parent_id: cleandedParentId }, 'id'); // eslint-disable-line
        });
    }

    return db(config.db.commentsTable).insert({ article_id: articleId, user_id: userId, ip, comment }, 'id'); // eslint-disable-line
}

module.exports = { save };
