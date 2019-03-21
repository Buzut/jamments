const http = require('http');
const config = require('./config');
const { generateWebsiteInfos, generateAllCaches } = require('./libs/cacheFilesGenerators');
const logger = require('./libs/logger');
const sendRes = require('./libs/sendRes');
const commentController = require('./controllers/commentController');

generateWebsiteInfos().catch(logger.error);
generateAllCaches().catch(logger.error);

http.createServer((req, res) => {
    // post new comment
    if (req.url === '/comment/' && req.method === 'POST') return commentController.addComment(req, res);

    // post new comment
    const validateCommentUrl = RegExp('/comment/validate/([0-9]+)').exec(req.url);
    if (validateCommentUrl && req.method === 'POST') return commentController.approveComment(req, res, validateCommentUrl[1]);

    // delete comment
    const modifyCommentUrl = RegExp('/comment/([0-9]+)').exec(req.url);

    if (modifyCommentUrl && req.method === 'PATCH') return commentController.updateComment(req, res, modifyCommentUrl[1]);
    if (modifyCommentUrl && req.method === 'DELETE') return commentController.deleteComment(req, res, modifyCommentUrl[1]);

    // unknown route
    return sendRes(res, 404, 'Resource Not Found');
})
.listen(config.port, () => {
    logger.info(`Listening for requests on post: ${config.port}`);
});
