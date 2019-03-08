const http = require('http');
const logger = require('./lib/logger');
const sendRes = require('./lib/sendRes');
const commentController = require('./commentController');

http.createServer((req, res) => {
    if (req.url === '/comment/' && req.method === 'POST') commentController(req, res);

    // unknown route
    else sendRes(res, 404, 'Resource Not Found');
})
.listen(8888, () => {
    logger.info('Listening for requests');
});
