const knex = require('knex');
const config = require('./config');
const db = require('./lib/connectDb');
const userModel = require('./models/userModel');
const articleModel = require('./models/articleModel');

const wpDbConf = {
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        database: 'buzut'
    },
    dbPrefix: 'Bztbl_'
};

const wpDb = knex(wpDbConf);
// const newDb = knex(config.newDb);

function createUsers() {
    return db.schema.hasTable(config.db.usersTable).then((exists) => {
        if (exists) return Promise.resolve();

        return db.schema.withSchema(config.db.connection.database).createTable(config.db.usersTable, (table) => {
            table.increments('id').unsigned().primary();
            table.string('name').notNullable();
            table.string('email').notNullable();
            table.string('md5_email', 32).notNullable().index('ind_md5');
        });
    });
}

function createArticles() {
    return db.schema.hasTable(config.db.articlesTable).then((exists) => {
        if (exists) return Promise.resolve();

        return db.schema.withSchema(config.db.connection.database).createTable(config.db.articlesTable, (table) => {
            table.increments('id').unsigned().primary();
            table.string('slug').notNullable();
            table.string('md5_slug', 32).notNullable().index('ind_md5');
        });
    });
}

function createComments() {
    return db.schema.hasTable(config.db.commentsTable).then((exists) => {
        if (exists) return Promise.resolve();

        return db.schema.withSchema(config.db.connection.database).createTable(config.db.commentsTable, (table) => {
            table.increments('id').unsigned().primary();
            table.integer('parent_id').unsigned();
            table.integer('article_id').unsigned().notNullable();
            table.integer('user_id').unsigned().notNullable();
            table.string('ip').notNullable();
            table.timestamp('submitted_at').defaultTo(db.fn.now());
            table.text('comment');
            table.foreign('parent_id', 'fk_com_parent').references('comments.id');
            table.foreign('article_id', 'fk_com_article').references('articles.id');
            table.foreign('user_id', 'fk_com_user').references('users.id');
        });
    });
}

function createNotifications() {
    return db.schema.hasTable(config.db.notificationsTable).then((exists) => {
        if (exists) return Promise.resolve();

        return db.schema.withSchema(config.db.connection.database).createTable(config.db.notificationsTable, (table) => {
            table.increments('id').unsigned().primary();
            table.integer('user_id').unsigned().notNullable().index('ind_user');
            table.integer('article_id').unsigned().notNullable().index('ind_article');
            table.boolean('notify').defaultTo(true);
            table.foreign('article_id', 'fk_notif_article').references('articles.id');
            table.foreign('user_id', 'fk_notif_user').references('users.id');
        });
    });
}

function saveComment(articleId, userId, ip, comment, commentDate) {
    return db(config.db.commentsTable).insert({ article_id: articleId, user_id: userId, submitted_at: commentDate, ip, comment }, 'id'); // eslint-disable-line
}

/* eslint no-restricted-syntax: off */
async function saveDbDatas(data) { // eslint-disable-line
    for (const entry of data) {
        await userModel.save(entry.comment_author, entry.comment_author_email) // eslint-disable-line
        .then((userId) => { // eslint-disable-line
            return articleModel.save(entry.post_name)
            .then(articleId => saveComment(articleId, userId, entry.comment_author_IP, entry.comment_content, entry.comment_date_gmt));
        })
        .catch(console.error); // eslint-disable-line
    }

    console.log('Migration finished'); // eslint-disable-line

    db.destroy();
    wpDb.destroy();
}

createUsers()
.then(createArticles)
.then(createComments)
.then(createNotifications)
.then(() => {
    console.log('Tables created'); // eslint-disable-line

    wpDb.select('comment_id', 'comment_parent', 'post_name', 'comment_author', 'comment_author_email', 'comment_author_IP', 'comment_date_gmt', 'comment_content')
    .from(`${wpDbConf.dbPrefix}comments`)
    .leftJoin('Bztbl_posts', 'comment_post_ID', 'ID')
    .then(saveDbDatas);
})
.catch(console.error); // eslint-disable-line
