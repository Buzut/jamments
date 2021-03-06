const BadRequestError = require('bad-request-error');
const uniqid = require('uniqid');
const config = require('../config'); // eslint-disable-line
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

    return db(config.db.usersTable).first('id', 'name', 'email', 'md5_email', 'secret').where('md5_email', md5Email)
    .then((res) => {
        if (res) return [res.id, res.name, res.email, res.md5_email, res.secret];

        const secret = uniqid();

        return db(config.db.usersTable).insert({
            secret,
            name: cleanedName,
            email: cleanedEmail,
            md5_email: md5Email
        })
        .then(id => [id, cleanedName, cleanedEmail, md5Email, secret]);
    });
}

function getUserSecret(email) {
    return db(config.db.usersTable).first('secret').where('md5_email', hashToMd5(lowerCase(trim(email))))
    .then((res) => {
        if (!res) return Promise.reject(new BadRequestError('User’s email can’t be found'));
        return res.secret;
    });
}

module.exports = { save, getUserSecret };
