const config = require('../config');
const BadRequestError = require('../libs/badRequestError');
const db = require('../libs/connectDb');
const { cleanSlug, hashToMd5 } = require('../libs/stringProcessors');

/**
 * Get all comments (w/ authors names)
 * @return { Promise }
 */
function getAll() {
    return db(config.db.commentsTable).select(`${config.db.commentsTable}.id`, 'parent_id', 'name', 'md5_email', 'submitted_at', 'comment', 'article_id')
    .innerJoin(config.db.usersTable, 'user_id', `${config.db.usersTable}.id`);
}

/**
 * Get comments for a given slug (w/ authors names)
 * @param { String } slug
 * @return { Promise }
 */
function getForSlug(slug) {
    return db(config.db.commentsTable).select(`${config.db.commentsTable}.id`, 'parent_id', 'name', 'md5_email', 'submitted_at', 'comment')
    .innerJoin(config.db.usersTable, 'user_id', `${config.db.usersTable}.id`)
    .innerJoin(config.db.articlesTable, 'article_id', `${config.db.articlesTable}.id`)
    .where({ md5_slug: hashToMd5(cleanSlug(slug)) });
}

/**
 * Validate and save comment
 * @param { Array } articleId
 * @param { Array } userId
 * @param { String } ip
 * @param { String } comment
 * @param { String } parentId
 * @return { Promise }
 * @return { Promise.resolve<Object> }
 * @return { Promise.reject<Error> } knex Err or BadRequestError
 */
function save(articleId, userId, ip, comment, parentId) {
    if (parentId && parentId) {
        return db(config.db.commentsTable).first('id').where({ id: parentId, article_id: articleId })
        .then((res) => {
            if (!res) return Promise.reject(new BadRequestError('parent_id must be a valid article id'));
            return db(config.db.commentsTable).insert({ article_id: articleId, user_id: userId, ip, comment, parent_id: parentId }, 'id'); // eslint-disable-line
        });
    }

    return db(config.db.commentsTable).insert({ article_id: articleId, user_id: userId, ip, comment }, 'id'); // eslint-disable-line
}

/**
 * Approve comment
 * @param { Number } commentId
 * @param { String } userSecret
 * @return { Promise }
 * @return { Promise.resolve<Object> }
 * @return { Promise.reject<Error> } knex Err or BadRequestError
 */
function approve(commentId, userSecret) {
    return db(config.db.commentsTable).first('secret')
    .innerJoin(config.db.usersTable, 'user_id', `${config.db.usersTable}.id`)
    .where({
        [`${config.db.commentsTable}.id`]: commentId,
        secret: userSecret
    })
    .then((res) => {
        if (!res) return Promise.reject(new BadRequestError('Either comment_id or user_secret don’t match'));
        return db(config.db.commentsTable).update('approved', true).where('id', commentId);
    });
}

module.exports = {
    getAll,
    getForSlug,
    save,
    approve
};
