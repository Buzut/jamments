const http = require('http');
const config = require('./config');
const { generateAllCaches } = require('./libs/cacheFilesGenerators');
const logger = require('./libs/logger');
const sendRes = require('./libs/sendRes');
const commentController = require('./controllers/commentController');

generateAllCaches().catch(logger.error);

http.createServer((req, res) => {
    if (req.url === '/comment/' && req.method === 'POST') commentController(req, res);

    // unknown route
    else sendRes(res, 404, 'Resource Not Found');
})
.listen(config.port, () => {
    logger.info('Listening for requests');
});
