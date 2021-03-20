const { promisify } = require('util');
const { writeFile } = require('fs');
const config = require('../config');
const articleModel = require('../models/articleModel');
const commentModel = require('../models/commentModel');
const { cleanSlug, hashToMd5 } = require('./stringProcessors');

const writeFileP = promisify(writeFile);

/**
 * Generate global file info for website with admin hash & comments nb/article
 * @return { Promise }
 */
function generateWebsiteInfos() {
    return commentModel.getCommentsPerArticle().then((commentsPerArticle) => {
        const siteInfos = { md5_admin_email: hashToMd5(config.adminEmail), commentsCount: {} };

        commentsPerArticle.forEach((el) => {
            siteInfos.commentsCount[el.slug] = el.total;
        });

        return writeFileP(config.cacheDirs.siteInfos + config.cacheDirs.ext, JSON.stringify(siteInfos));
    });
}

/**
 * Write content as stringified JSON to a cache file
 * Create file if doesn't exist, override if exists
 * @param { String } slug
 * @param { Array } content
 * @return { Promise }
 */
function writeCacheFile(slug, content) {
    const path = config.cacheDirs.article + slug.replace(/\//g, '_') + config.cacheDirs.ext;
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
        }, {});

        const writePromises = articles.map(article => writeCacheFile(article.slug, sortedComments[article.id]));
        return Promise.all(writePromises);
    });
}

/**
 * Generate cache file for a given article and refresh websitre global infos cache
 * @param { Number } articleId
 * @return { Promise }
 */
function generateArticleCache(articleId) {
    return articleModel.getSlug(articleId)
    .then(
        slug => commentModel.getForId(articleId)
        .then(comments => Promise.all([
            generateWebsiteInfos(),
            writeCacheFile(slug, comments)
        ]))
    );
}

module.exports = {
    generateWebsiteInfos,
    generateAllCaches,
    generateArticleCache
};
