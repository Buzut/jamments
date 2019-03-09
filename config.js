process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

module.exports = {
    db: {
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

    // this doesn't need to be changed either
    cacheDirs: {
        ext: '.json',
        article: './article/'
    },

    // production only,
    // in development, logs are outputed to the console and ./applogs.log
    appLogFile: '/var/log/jamComments.log'
};
