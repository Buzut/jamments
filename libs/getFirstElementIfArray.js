/**
 * Return first val element if is array, raw value otherwise
 * It helps working with Knex that always returns ids as arrays
 * @param { String | Array }
 * @return { * }
 */
function getFirstElementIfArray(val) {
    if (Array.isArray(val) && val.length) return val[0];
    return val;
}

module.exports = getFirstElementIfArray;
