module.exports = {
    name: 'user_secret',
    type: 'string',
    validator: v => v.length(18),
    failMsg: 'user_secret should be 18 chars'
};
