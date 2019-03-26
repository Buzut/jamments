CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    md5_email VARCHAR(32) NOT NULL,
    secret VARCHAR(18) NOT NULL,
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
    approved BOOL NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    INDEX ind_article_id (article_id),
    CONSTRAINT fk_com_parent
        FOREIGN KEY (parent_id)
        REFERENCES comments (id)
        ON DELETE SET NULL
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
