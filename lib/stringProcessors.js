const crypto = require('crypto');

function trim(string) {
    return string.trim();
}

function lowerCase(string) {
    return string.toLowerCase();
}

function trimSlashes(string) {
    return string.replace(/^\/|\/$/g, '');
}

function hashToMd5(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}

function cleanSlug(slug) {
    return lowerCase(trimSlashes(trim(slug)));
}

module.exports = {
    trim,
    lowerCase,
    trimSlashes,
    hashToMd5,
    cleanSlug
};
