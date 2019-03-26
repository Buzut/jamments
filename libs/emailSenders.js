const email = require('emailjs');
const config = require('../config');
const { cleanSlug } = require('./stringProcessors');

const emailServer = email.server.connect(config.email.server);

/**
 * Send an email
 * @param { (String | Array) } to
 * @param { String } text
 * @param { String } subject
 * @return { Promise }
 */
function sendMail(to, subject, text) {
    return new Promise((resolve, reject) => {
        emailServer.send({
            to,
            subject,
            text,
            from: config.email.senderAddr
        }, (err, msg) => {
            if (err) return reject(new Error(err));
            return resolve(msg);
        });
    });
}

/**
 * Send email confirmation to validate new comment
 * @param { Object } param
 * @param { String } param.to
 * @param { String } param.name
 * @param { String } param.md5Email
 * @param { String } param.secret
 * @param { Number } param.commentId
 * @return { Promise }
 */
function sendNewCommentValidationMail({ userName, userEmail, userMd5Email, userSecret, commentId, slug }) { // eslint-disable-line
    let link;
    const linkParams = encodeURIComponent(JSON.stringify({ md5_email: userMd5Email, user_secret: userSecret, comment_id: commentId }));

    if (config.email.linkValidationAddrIsCommentPage && config.email.linkTrailingSlash) link = `${config.siteUrl}/${cleanSlug(slug)}/?validate_comment=${linkParams}`;
    else if (config.email.linkValidationAddrIsCommentPage) link = `${config.siteUrl}/${cleanSlug(slug)}?validate_comment=${linkParams}`;
    else if (config.email.linkTrailingSlash) link = `${config.siteUrl}/?validate_comment=${linkParams}`;
    else link = `${config.siteUrl}?validate_comment=${linkParams}`;

    return sendMail(
        userEmail,
        config.email.commentValidationSubject,
        config.email.commentValidationBody.replace('%name%', userName).replace('%link%', link)
    );
}

/**
 * Send a notification on new comment (subscribers and admin)
 * @param { Array } recipients
 * @param { Number } articleId
 * @param { String } slug
 * @return { Promise }
 */
function sendNewCommentNotification(recipients, articleId, slug) {
    let conversationlink;
    let unsubscribelink;
    const promises = [];

    if (config.email.linkTrailingSlash && config.email.commentsSectionAnchor) conversationlink = `${config.siteUrl}/${slug}/${config.email.commentsSectionAnchor}`;
    else if (config.email.linkTrailingSlash) conversationlink = `${config.siteUrl}/${slug}/`;
    else if (config.email.commentsSectionAnchor) conversationlink = `${config.siteUrl}/${slug}${config.email.commentsSectionAnchor}`;
    else conversationlink = `${config.siteUrl}/${slug}`;

    recipients.forEach((recipient) => {
        if (config.email.linkTrailingSlash) unsubscribelink = `${config.siteUrl}/${slug}/?unsubscribe_from_comments_notif=1&article_id=${articleId}&user_id=${recipient.user_id}&user_secret=${recipient.secret}`;
        else unsubscribelink = `${config.siteUrl}/${slug}?unsubscribe_from_comments_notif=1&article_id=${articleId}&user_id=${recipient.user_id}&user_secret=${recipient.secret}`;

        promises.push(sendMail(
            recipient.email,
            config.email.newCommentSubject,
            config.email.newCommentBody.replace('%name%', recipient.name).replace('%conversationlink%', conversationlink).replace('%unsubscribelink%', unsubscribelink)
        ));
    });

    promises.push(sendMail(
        config.adminEmail,
        config.email.newCommentSubject,
        config.email.newCommentAdminBody.replace('%unsubscribelink%', unsubscribelink)
    ));

    return Promise.all(promises);
}

module.exports = { sendMail, sendNewCommentValidationMail, sendNewCommentNotification };
