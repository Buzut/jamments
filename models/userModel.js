const config = require('../config');
const db = require('../libs/connectDb');
const { trim, lowerCase, hashToMd5 } = require('../libs/stringProcessors');

/**
 * Save user if doesn't already exist
 * @param { String } name
 * @param { String } email
 * @return { Promise }
 */
function save(name, email) {
    const cleanedName = trim(name);
    const cleanedEmail = lowerCase(trim(email));
    const md5Email = hashToMd5(cleanedEmail);

    return db(config.db.usersTable).select('id').where('md5_email', md5Email)
    .then((res) => {
        if (res && res.length) return [res[0].id];
        return db(config.db.usersTable).insert({ name: cleanedName, email: cleanedEmail, md5_email: md5Email }, 'id');
    });
}

module.exports = { save };
