const config = require('../config');
const BadRequestError = require('../lib/badRequestError');
const db = require('../lib/connectDb');
const { cleanSlug, hashToMd5 } = require('../lib/stringProcessors');

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

module.exports = { save, getAll, getForSlug };
