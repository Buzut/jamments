const email = require('emailjs');
const mailjet = require('node-mailjet');
const config = require('../config'); // eslint-disable-line
const { cleanSlug } = require('./stringProcessors');

let emailServer;
let mailjetSend;
if (config.email.server) emailServer = email.server.connect(config.email.server);
if (config.email.mailjet) mailjetSend = mailjet.connect(config.email.mailjet.pubkey, config.email.mailjet.privkey);

/**
 * Send an email via Mailjet
 * @param { (String | Array) } to
 * @param { Number } templateId
 * @param { String } subject
 * @param { Object } variables
 * @return { Promise }
 */
function sendMailWithMailjet(to, templateId, subject, variables) {
    let recipients;
    if (Array.isArray(to)) recipients = to.map(recipient => ({ Email: recipient }));
    else recipients = [{ Email: to }];

    return mailjetSend.post('send', { version: 'v3.1' })
    .request({
        Messages: [{
            From: {
                Email: config.email.senderAddr,
                Name: config.email.senderName
            },
            To: recipients,
            TemplateID: templateId,
            TemplateLanguage: true,
            Subject: subject,
            Variables: variables
        }]
    });
}


/**
 * Send an email via SMTP
 * @param { (String | Array) } to
 * @param { String } text
 * @param { String } subject
 * @return { Promise }
 */
function sendMailWithSMTP(to, subject, text) {
    return new Promise((resolve, reject) => {
        const from = config.email.senderName ? `${config.email.senderName} <${config.email.senderAddr}>` : config.email.senderAddr;

        emailServer.send({
            to,
            subject,
            text,
            from
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
    const linkParams = `validate_comment=1&md5_email=${userMd5Email}&user_secret=${userSecret}&comment_id=${commentId}`;

    if (config.email.linkValidationAddrIsCommentPage && config.email.linkTrailingSlash) link = `${config.siteUrl}/${cleanSlug(slug)}/?${linkParams}`;
    else if (config.email.linkValidationAddrIsCommentPage) link = `${config.siteUrl}/${cleanSlug(slug)}?${linkParams}`;
    else if (config.email.linkTrailingSlash) link = `${config.siteUrl}/?${linkParams}`;
    else link = `${config.siteUrl}?${linkParams}`;

    if (config.email.server) {
        return sendMailWithSMTP(
            userEmail,
            config.email.commentValidationSubject,
            config.email.commentValidationBody.replace('%name%', userName).replace('%link%', link)
        );
    }

    return sendMailWithMailjet(
        userEmail,
        config.email.commentValidationTemplateId,
        config.email.commentValidationSubject,
        { link, name: userName }
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

        if (config.email.server) {
            promises.push(sendMailWithSMTP(
                recipient.email,
                config.email.newCommentSubject,
                config.email.newCommentBody.replace('%name%', recipient.name).replace('%conversationlink%', conversationlink).replace('%unsubscribelink%', unsubscribelink)
            ));
        }

        else {
            promises.push(sendMailWithMailjet(
                recipient.email,
                config.email.newCommentTemplateId,
                config.email.newCommentSubject,
                { conversationlink, unsubscribelink, name: recipient.name }
            ));
        }
    });

    if (config.email.server) {
        promises.push(sendMailWithSMTP(
            config.adminEmail,
            config.email.newCommentSubject,
            config.email.newCommentAdminBody.replace('%conversationlink%', conversationlink)
        ));
    }

    else {
        promises.push(sendMailWithMailjet(
            config.adminEmail,
            config.email.newCommentAdminTemplateId,
            config.email.newCommentSubject,
            { conversationlink }
        ));
    }

    return Promise.all(promises);
}

module.exports = { sendMailWithSMTP, sendNewCommentValidationMail, sendNewCommentNotification };
