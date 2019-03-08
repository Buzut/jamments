const crypto = require('crypto');
const config = require('../config');
const db = require('../lib/connectDb');

/**
 * Save user if doesn't already exist
 * @param { String } name
 * @param { String } email
 * @return { Promise }
 */
function save(name, email) {
    const cleanedName = name.trim();
    const cleanedEmail = email.trim().toLowerCase();
    const md5Email = crypto.createHash('md5').update(email).digest('hex');
    // console.log(db(config.db.usersTable).select('id').where({ md5_email: md5Email }).toString());

    return db(config.db.usersTable).select('id').where('md5_email', md5Email)
    .then((res) => {
        if (res && res.length) return [res[0].id];
        return db(config.db.usersTable).insert({ name: cleanedName, email: cleanedEmail, md5_email: md5Email }, 'id');
    });
}

module.exports = { save };
