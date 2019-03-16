const http = require('http');
const config = require('./config');
const { generateAllCaches } = require('./libs/cacheFilesGenerators');
const logger = require('./libs/logger');
const sendRes = require('./libs/sendRes');
const commentController = require('./controllers/commentController');

generateAllCaches().catch(logger.error);

http.createServer((req, res) => {
    // post new comment
    if (req.url === '/comment/' && req.method === 'POST') return commentController.addComment(req, res);

    // confirm a comment
    const commentId = RegExp('/comment/validate/([0-9]+)').exec(req.url);
    if (commentId && req.method === 'POST') return commentController.approveComment(req, res, commentId[1]);

    // unknown route
    return sendRes(res, 404, 'Resource Not Found');
})
.listen(config.port, () => {
    logger.info('Listening for requests');
});
