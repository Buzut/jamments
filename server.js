const http = require('http');
const config = require('./config'); // eslint-disable-line
const { generateWebsiteInfos, generateAllCaches } = require('./libs/cacheFilesGenerators');
const logger = require('./libs/logger');
const sendRes = require('./libs/sendRes');
const commentController = require('./controllers/commentController');
const notificationController = require('./controllers/notificationController');

generateWebsiteInfos().catch(logger.error);
generateAllCaches().catch(logger.error);

http.createServer((req, res) => {
    if (config.manageCors) {
        res.setHeader('Access-Control-Allow-Origin', config.siteUrl);

        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PATCH');
            res.setHeader('Access-Control-Allow-Headers', 'uploader-chunk-number,uploader-chunks-total,uploader-file-id');
            res.setHeader('Access-Control-Max-Age', '86400'); // 24hrs
            res.writeHead(204, 'No Content');
            res.end();
            return;
        }
    }

    /**
     * SERVED FROM CACHE
     *
     * @api { GET } /infos/site.json Get global site infos
     * @apiName getSiteInfos
     * @apiGroup Infos
     *
     * @apiSuccess (200) { JSON } comments Article's comments with commenters infos
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/2.0 200 OK
     *     {
     *         {
     *             "md5_admin_email": "140338da61f6172949f863b39e61afae",
     *             "commentsCount": {
     *                 "hello-npm": 15,
     *                 …
     *             }
     *         }
     *     }
     */

    /**
      * SERVED FROM CACHE
      *
      * @api { GET } /article/:slug Get comments for a page
      * @apiName getArticleComments
      * @apiGroup Comments
      *
      * @apiParam { String } slug The page's slug for which the comment was posted (suffixed by .json)
      *
      * @apiSuccess (200) { JSON } comments Article's comments with commenters infos
      *
      * @apiSuccessExample Success-Response:
      *     HTTP/2.0 200 OK
      *     [
      *         {
      *             "id": 960,
      *             "parent_id": null,
      *             "name": "Lugdanum",
      *             "md5_email": "23d8cf593dab275ab59ea3a8dcfb6eef",
      *             "submitted_at": "2019-03-16T21:41:57.000Z",
      *             "comment": "…"
      *         },
      *         {
      *             "id": 961,
      *             "parent_id": 960,
      *             "name": "Buzut",
      *             "md5_email": "140338da61f6172949f863b39e61afae",
      *             "submitted_at": "2019-03-16T23:42:25.000Z"",
      *             "comment": "…"
      *         }
      *     ]
      *
      * @apiError { text/plain } typeErr paramX param must be a typeY
      *
      * @apiError { text/plain } nameErr name must be between 3 and 20 chars
      *
      * @apiError { text/plain } emailErr email must be an email string
      *
      * @apiError { text/plain } commentErr comment cannot be longer than 3000 chars
      *
      * @apiError { text/plain } unknowToken The provided token is invalid
      *
      * @apiErrorExample Error-Response:
      *    HTTP/2.0 404 Not Found
      */

    /**
     * @api { POST } /comment/ Post a new comment
     * @apiName postComment
     * @apiGroup Comments
     *
     * @apiParam { String } slug The page's slug for which the comment is posted
     *
     * @apiParam { String{3..20} } name
     *
     * @apiParam { String } email
     *
     * @apiParam { String{..3000} } comment
     *
     * @apiParam { Integer\String } [parent_id] An integer or a string containing an interger that represents the parent_id
     *
     * @apiParam { Boolean\String } [notify=true] A bool or string [true|false] stating if the commenter whish to be notified of following comments in this thread
     *
     * @apiSuccess (201) { Null } null
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/2.0 201 Created
     *
     * @apiError { text/plain } typeErr paramX param must be a typeY
     *
     * @apiError { text/plain } nameErr name must be between 3 and 20 chars
     *
     * @apiError { text/plain } emailErr email must be an email string
     *
     * @apiError { text/plain } emailMXErr Your email seems unreachable
     *
     * @apiError { text/plain } commentErr comment cannot be longer than 3000 chars
     *
     * @apiError { text/plain } parentErr parent_id must be a valid article id
     *
     * @apiErrorExample Error-Response:
     *    HTTP/2.0 400 Bad Request
     *    typeErr paramX param must be a typeY
     */
    if (req.url === '/comment/' && req.method === 'POST') return commentController.addComment(req, res);

    /**
     * @api { POST } /comment/validate/:comment_id Validate a comment
     * @apiName validateComment
     * @apiGroup Comments
     *
     * @apiParam { String } comment_id Passed in url
     *
     * @apiParam { String } user_secret As received in the validation email
     *
     * @apiSuccess (204) { Null } null
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/2.0 204 No Content
     *
     * @apiError { text/plain } userSecretErr user_secret should be 18 chars
     *
     * @apiError { text/plain } mismatch Either comment_id or user_secret don’t match
     *
     * @apiErrorExample Error-Response:
     *    HTTP/2.0 404 Not Found
     *
     * @apiErrorExample Error-Response:
     *    HTTP/2.0 400 Bad Request
     *    userSecretErr user_secret should be 18 chars
     */
    const validateCommentUrl = RegExp('/comment/validate/([0-9]+)').exec(req.url);
    if (validateCommentUrl && req.method === 'POST') return commentController.approveComment(req, res, validateCommentUrl[1]);

    // for patch and delete comment
    const modifyCommentUrl = RegExp('/comment/([0-9]+)').exec(req.url);

    /**
     * @api { PATCH } /comment/:comment_id Update a comment
     * @apiName updateComment
     * @apiGroup Comments
     *
     * @apiParam { String } comment_id Passed in url
     *
     * @apiParam { String } user_secret As received in the validation email
     *
     * @apiParam { String{..3000} } comment
     *
     * @apiSuccess (204) { Null } null
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/2.0 204 No Content
     *
     * @apiError { text/plain } userSecretErr user_secret should be 18 chars
     *
     * @apiError { text/plain } commentErr comment cannot be longer than 3000 chars
     *
     * @apiError { text/plain } mismatch Either comment_id or user_secret don’t match
     *
     * @apiErrorExample Error-Response:
     *    HTTP/2.0 404 Not Found
     *
     * @apiErrorExample Error-Response:
     *    HTTP/2.0 400 Bad Request
     *    userSecretErr user_secret should be 18 chars
     */
    if (modifyCommentUrl && req.method === 'PATCH') return commentController.updateComment(req, res, modifyCommentUrl[1]);

    /**
     * @api { DELETE } /comment/:comment_id Delete a comment
     * @apiName deleteComment
     * @apiGroup Comments
     *
     * @apiParam { String } comment_id Passed in url
     *
     * @apiParam { String } user_secret As received in the validation email
     *
     * @apiSuccess (204) { Null } null
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/2.0 204 No Content
     *
     * @apiError { text/plain } userSecretErr user_secret should be 18 chars
     *
     * @apiError { text/plain } mismatch Either comment_id or user_secret don’t match
     *
     * @apiError { text/plain } authErr User is not allowed to delete this comment
     *
     * @apiErrorExample Error-Response:
     *    HTTP/2.0 404 Not Found
     *
     * @apiErrorExample Error-Response:
     *    HTTP/2.0 400 Bad Request
     *    userSecretErr user_secret should be 18 chars
     */
    if (modifyCommentUrl && req.method === 'DELETE') return commentController.deleteComment(req, res, modifyCommentUrl[1]);

    /**
     * @api { PATCH } /notification/article/:article_id Update notification behaviour
     * @apiName updateNotification
     * @apiGroup Notifications
     *
     * @apiParam { String } article_id Passed in url
     *
     * @apiParam { String } user_id As received in the notification email
     *
     * @apiParam { String } user_secret As received in the notification email
     *
     * @apiSuccess (204) { Null } null
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/2.0 204 No Content
     *
     * @apiError { text/plain } typeErr paramX param must be a typeY
     *
     * @apiError { text/plain } userSecretErr user_secret should be 18 chars
     *
     * @apiError { text/plain } mismatch Either comment_id, user_id or user_secret don’t match
     *
     * @apiErrorExample Error-Response:
     *    HTTP/2.0 404 Not Found
     *
     * @apiErrorExample Error-Response:
     *    HTTP/2.0 400 Bad Request
     *    userSecretErr user_secret should be 18 chars
     */
    const validateNotification = RegExp('/notification/article/([0-9]+)').exec(req.url);
    if (validateNotification && req.method === 'PATCH') return notificationController.updateSubscription(req, res, validateNotification[1]);

    // unknown route
    return sendRes(res, 404, 'Resource Not Found');
})
.listen(config.port, () => {
    logger.info(`Listening for requests on post: ${config.port}`);
});
