const crypto = require('crypto');
const config = require('../config');
const db = require('../lib/connectDb');

/**
 * Save article if doesn't already exist
 * @param { String } slug
 * @return { Promise }
 */
function save(slug) {
    const cleanedSlug = slug.trim().toLowerCase().replace(/^\/|\/$/g, '');
    const md5Slug = crypto.createHash('md5').update(slug).digest('hex');

    return db(config.db.articlesTable).select('id').where('md5_slug', md5Slug)
    .then((res) => {
        if (res && res.length) return [res[0].id];
        return db(config.db.articlesTable).insert({ slug: cleanedSlug, md5_slug: md5Slug }, 'id');
    });
}

module.exports = { save };
