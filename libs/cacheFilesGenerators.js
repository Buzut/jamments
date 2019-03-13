const { promisify } = require('util');
const { writeFile } = require('fs');
const config = require('../config');
const articleModel = require('../models/articleModel');
const commentModel = require('../models/commentModel');
const { cleanSlug } = require('./stringProcessors');

const writeFileP = promisify(writeFile);

/**
 * Write content as stringified JSON to a cache file
 * Create file if doesn't exist, override if exists
 * @param { String } slug
 * @param { Array } content
 * @return { Promise }
 */
function writeCacheFile(slug, content) {
    const path = config.cacheDirs.article + cleanSlug(slug) + config.cacheDirs.ext;
    return writeFileP(path, JSON.stringify(content));
}

/**
 * Generate all cache files
 * @return { Promise }
 */
function generateAllCaches() {
    return Promise.all([
        articleModel.getAll(),
        commentModel.getAll()
    ])
    .then(([articles, comments]) => {
        /* loop n comments + n articles
           alternatively filtering comments for each article – comments.forEach(articles.filter)
           would loop n articles * n comments */

        const sortedComments = comments.reduce((sorted, comment) => {
            const articleId = comment.article_id;
            delete comment.article_id;

            if (Array.isArray(sorted[articleId])) sorted[articleId].push(comment);
            else sorted[articleId] = [comment];
            return sorted;
        });

        const writePromises = articles.map(article => writeCacheFile(article.slug, sortedComments[article.id]));
        return Promise.all(writePromises);
    });
}

/**
 * Generate cache file for a given article
 * @param { String } slug
 * @return { Promise }
 */
function generateArticleCache(slug) {
    return commentModel.getForSlug(slug).then(comments => writeCacheFile(slug, comments));
}

module.exports = {
    generateAllCaches,
    generateArticleCache
};
