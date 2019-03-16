/**
 * Make sure email looks like an email
 * @param { String }
 * @return { Bool }
 */
function isEmail(val) {
    const validEmail = new RegExp('^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,6}$', 'i');

    if (validEmail.test(val)) return true;
    return false;
}

module.exports = isEmail;
