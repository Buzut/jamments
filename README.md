# JAMstack comments
JAMstack comments is a self hosted commenting API that works with your site.

There's no script to include, no automatic DOM injection, no default CSS to customize, you're in full control. It's a dead simple REST API that seamlessly integrates to your already existing [JAMstack](https://jamstack.org/).

You're free to choose the database you want to work with:

* SQLite
* MySQL
* MariaDB
* PostgreSQL
* MSSQL

It's written in Node.js and is automatically cached, so no worries, it's fast!

## Getting started
### Create new database
_Exemples below are MySQL but as it's standard SQL, it should be the same or almost the same in other DB engines._

You need to manually create the database before everything.

```sql
CREATE DATABASE blog_comments DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
```

If you're willing to migrate comments from another commenting system, take a look at the [migration guide](./migrate.md).

### Update `config.js`
By default, `config.js` is working for a local testing database with root user and no password, this is definitely not what you want!

So update it with your own settings. For more info about possible settings for different DB engines, check [Knex.js documentation](https://knexjs.org/#Installation-client).

The tables are automatically created by the init script, but I leave theme here for reference.

```sql
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    md5_email VARCHAR(32) NOT NULL,
    PRIMARY KEY (id),
    INDEX ind_md5 (md5_email)
);

CREATE TABLE articles (
    id INT UNSIGNED AUTO_INCREMENT,
    slug VARCHAR(255) NOT NULL,
    md5_slug VARCHAR(32) NOT NULL,
    PRIMARY KEY (id),
    INDEX ind_md5 (md5_slug)
);

CREATE TABLE comments (
    id INT UNSIGNED AUTO_INCREMENT,
    parent_id INT UNSIGNED,
    article_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    ip VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW(),
    comment TEXT,
    PRIMARY KEY (id),
    CONSTRAINT fk_com_parent
        FOREIGN KEY (parent_id)
        REFERENCES comments (id)
    CONSTRAINT fk_com_article
        FOREIGN KEY (article_id)
        REFERENCES articles (id)
    CONSTRAINT fk_com_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
);

CREATE TABLE notifications (
    id INT UNSIGNED AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    article_id INT UNSIGNED NOT NULL,
    notify BOOL NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    INDEX ind_user (user_id)
    INDEX ind_article (article_id)
    CONSTRAINT fk_notif_article
        FOREIGN KEY (article_id)
        REFERENCES articles (id)
    CONSTRAINT fk_notif_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
);
```
