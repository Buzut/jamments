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

function saveComment(parentId, articleId, userId, ip, comment, commentDate) {
    return db(config.db.commentsTable).insert({ article_id: articleId, user_id: userId, submitted_at: commentDate, parent_id: parentId, ip, comment }, 'id'); // eslint-disable-line
}

/* eslint no-restricted-syntax: off */
async function saveDbDatas(data) { // eslint-disable-line
    let i = 1;
    const idMapping = {};

    for (const entry of data) {
        idMapping[entry.comment_id] = i++; // keep track of new ids for children comments

        await userModel.save(entry.comment_author, entry.comment_author_email) // eslint-disable-line
        .then((userId) => {
            const parentId = entry.comment_parent ? idMapping[entry.comment_parent] : undefined;

            return articleModel.save(entry.post_name)
            .then(articleId => saveComment(parentId, articleId, userId, entry.comment_author_IP, entry.comment_content, entry.comment_date));
        })
        .catch(console.error); // eslint-disable-line
    }

    console.log('Migration finished'); // eslint-disable-line

    db.destroy();
    wpDb.destroy();
}

wpDb.select('comment_id', 'comment_parent', 'post_name', 'comment_author', 'comment_author_email', 'comment_author_IP', 'comment_date', 'comment_content')
.from(`${wpDbConf.dbPrefix}comments`)
.innerJoin(`${wpDbConf.dbPrefix}posts`, 'comment_post_ID', 'ID')
.then(saveDbDatas)
.catch(console.error); // eslint-disable-line
