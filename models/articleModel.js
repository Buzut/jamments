const config = require('../config'); // eslint-disable-line
const db = require('../libs/connectDb');
const { cleanSlug, hashToMd5 } = require('../libs/stringProcessors');

/**
 * Get all articles (ids and slugs)
 * @return { Promise }
 */
function getAll() {
    return db(config.db.articlesTable).select('id', 'slug');
}

/**
 * Get slug for an article
 * @param { Number } id
 * @return { Promise }
 * @return { Promise.resolve<String> } slug
 * @return { Promise.reject<Error> } knex Err
 */
function getSlug(id) {
    return db(config.db.articlesTable).first('slug').where({ id })
    .then(res => res.slug);
}

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

module.exports = { getAll, getSlug, save };
