process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

module.exports = {
    siteUrl: 'https://my-blog.net', // without trailing slash
    adminEmail: 'hello@my-blog.net', // you'll have to leave at least one comment with admin email to be able to edit/delete comments
    userCanDeleteComments: false, // can user delete its own comments? (if false, only admin can)

    db: {
        // check options at https://knexjs.org/
        client: 'mysql',
        connection: {
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'blog_comments'
        },

        // no need to change these
        usersTable: 'users',
        articlesTable: 'articles',
        commentsTable: 'comments',
        notificationsTable: 'notifications'
    },

    email: {
        // check options at https://www.npmjs.com/package/emailjs
        server: {
            user: 'hello@my-blog.net',
            password: 'xxxxx',
            host: 'smtp.your-email.com',
            ssl: true
            // tls: { ciphers: 'SSLv3' }
        },
        senderAddr: 'hello@my-blog.net',
        commentValidationSubject: 'Confirm your comment on Buzut’s blog',

        // %name% and %link% will be dynamically replaced by their respective values (\n goes to next line)
        commentValidationBody: 'Hey %name%!\n\n Thank you very much for leaving a comment on my blog.\n\n Please, just to make sure you’re not a bot, click the following link:\n%link%\n\n Thank you :)',
        linkValidationAddrIsCommentPage: true, // validation link goes to article page or root domain
        linkValidationAddrTrailingSlash: true // whether to add a slash at the end of the url before url params (buzut.net/article/?p=… VS buzut.net/article?p=…)
    },

    // this doesn't need to be changed either
    cacheDirs: {
        ext: '.json',
        siteInfos: './infos/site', // file & dir here (res: ./infos.site.json)
        article: './article/'
    },

    // production only,
    // in development, logs are outputed to the console and ./applogs.log
    appLogFile: './jamComments.log',
    port: 8888
};
