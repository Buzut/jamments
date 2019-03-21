const config = require('../config');
const BadRequestError = require('../libs/badRequestError');
const db = require('../libs/connectDb');

/**
 * Get all comments (w/ authors names)
 * @return { Promise }
 */
function getAll() {
    return db(config.db.commentsTable).select(`${config.db.commentsTable}.id`, 'parent_id', 'name', 'md5_email', 'submitted_at', 'comment', 'article_id')
    .innerJoin(config.db.usersTable, 'user_id', `${config.db.usersTable}.id`);
}

/**
 * Compute comments (validated only) per article
 * @return { Promise }
 */
function getCommentsPerArticle() {
    return db(config.db.commentsTable)
    .count(`${config.db.commentsTable}.id as total`)
    .select('slug')
    .innerJoin(config.db.articlesTable, 'article_id', `${config.db.articlesTable}.id`)
    .where('approved', true)
    .groupBy('slug');
}

/**
 * Get comments for a given slug (w/ authors names)
 * @param { Number } articleId
 * @return { Promise }
 */
function getForId(id) {
    return db(config.db.commentsTable).select(`${config.db.commentsTable}.id`, 'parent_id', 'name', 'md5_email', 'submitted_at', 'comment')
    .innerJoin(config.db.usersTable, 'user_id', `${config.db.usersTable}.id`)
    .where({ article_id: id, approved: true });
}

/**
 * Validate and save comment
 * @param { Array } articleId
 * @param { Array } userId
 * @param { String } ip
 * @param { String } comment
 * @param { String } parentId
 * @return { Promise }
 * @return { Promise.resolve<String> } commentId
 * @return { Promise.reject<Error> } knex Err or BadRequestError
 */
function save(articleId, userId, ip, comment, parentId) {
    if (parentId && parentId) {
        return db(config.db.commentsTable).first('id').where({ id: parentId, article_id: articleId })
        .then((res) => {
            if (!res) return Promise.reject(new BadRequestError('parent_id must be a valid article id'));
            return db(config.db.commentsTable).insert({
                ip,
                comment,
                article_id: articleId,
                user_id: userId,
                parent_id: parentId
            }, 'id')
            .then(id => id[0]);
        });
    }

    return db(config.db.commentsTable).insert({
        ip,
        comment,
        article_id: articleId,
        user_id: userId
    }, 'id')
    .then(id => id[0]);
}

/**
 * Approve comment
 * @param { Number } commentId
 * @param { String } userSecret
 * @return { Promise }
 * @return { Promise.resolve<String> } articleId
 * @return { Promise.reject<Error> } knex Err or BadRequestError
 */
function approve(commentId, userSecret) {
    return db(config.db.commentsTable).first('article_id')
    .innerJoin(config.db.usersTable, 'user_id', `${config.db.usersTable}.id`)
    .where({
        [`${config.db.commentsTable}.id`]: commentId,
        secret: userSecret
    })
    .then((res) => {
        if (!res) return Promise.reject(new BadRequestError('Either comment_id or user_secret don’t match'));
        return db(config.db.commentsTable).update('approved', true).where('id', commentId)
        .then(() => res.article_id);
    });
}

/**
 * Delete comment if user is author or admin
 * @param { Number } commentId
 * @param { String } userSecret
 * @return { Promise }
 * @return { Promise.resolve<String> } articleId
 * @return { Promise.reject<Error> } knex Err or BadRequestError
 */
function erase(commentId, userSecret, adminSecret) {
    if (userSecret === adminSecret) {
        return db(config.db.commentsTable).delete().where(`${config.db.commentsTable}.id`, commentId);
    }

    if (config.userCanDeleteComments) {
        return db(config.db.commentsTable)
        .first(`${config.db.commentsTable}.id`)
        .innerJoin(config.db.usersTable, 'user_id', `${config.db.usersTable}.id`)
        .where({
            [`${config.db.commentsTable}.id`]: commentId,
            secret: userSecret
        })
        .then((res) => {
            if (!res) return Promise.reject(new BadRequestError('Either comment_id or user_secret don’t match'));
            return db(config.db.commentsTable).delete().where(`${config.db.commentsTable}.id`, commentId);
        });
    }

    return Promise.reject(new BadRequestError('User is not allowed to delete this comment'));
}

module.exports = {
    getAll,
    getCommentsPerArticle,
    getForId,
    save,
    approve,
    erase
};
