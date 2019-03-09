const config = require('../config');
const db = require('../lib/connectDb');
const { cleanSlug, hashToMd5 } = require('../lib/stringProcessors');

/**
 * Save article if doesn't already exist
 * @param { String } slug
 * @return { Promise }
 */
function save(slug) {
    const cleanedSlug = cleanSlug(slug);
    const md5Slug = hashToMd5(cleanedSlug);

    return db(config.db.articlesTable).select('id').where('md5_slug', md5Slug)
    .then((res) => {
        if (res && res.length) return [res[0].id];
        return db(config.db.articlesTable).insert({ slug: cleanedSlug, md5_slug: md5Slug }, 'id');
    });
}

module.exports = { save };
