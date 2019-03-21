const knex = require('knex');
const config = require('./config');

const db = knex(config.db);

function createUsers() {
    return db.schema.hasTable(config.db.usersTable).then((exists) => {
        if (exists) return Promise.resolve();

        return db.schema.withSchema(config.db.connection.database).createTable(config.db.usersTable, (table) => {
            table.increments('id').unsigned().primary();
            table.string('name').notNullable();
            table.string('email').notNullable();
            table.string('md5_email', 32).notNullable().index('ind_md5');
            table.string('secret', 18).notNullable();
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
            table.boolean('approved').defaultTo(false);
            table.foreign('parent_id', 'fk_com_parent').references('comments.id').onDelete('SET NULL');
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

createUsers()
.then(createArticles)
.then(createComments)
.then(createNotifications)
.then(() => {
    console.log('Tables created'); // eslint-disable-line
    db.destroy();
})
.catch(console.error); // eslint-disable-line
