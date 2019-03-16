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

### Dependencies
You will need Node.js and npm on top of the database of your choice. On most Linux distros, you should be able to install Node straight from your package manager.

```shell
# Debian flavor
apt install nodejs && apt install npm
```

For more information on installation options, you should refer to Node.js [official documentation](https://nodejs.org/en/).

### Database
_Exemples below are MySQL but as it's standard SQL, it should be the same or almost the same for other DB engines._

You need to manually create the database before everything.

```sql
CREATE DATABASE blog_comments DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;

-- dedicated user could be a good thing too
CREATE USER comments@localhost IDENTIFIED BY 'YOUR PASSWD';

-- and define rights
GRANT ALL PRIVILEGES ON blog_comments.* TO comments@localhost;
```

You could actually have more restrictive rights, but you'll have to [create the tables manually](./tables.sql) with a more privileged user.

```sql
GRANT SELECT, UPDATE, DELETE ON blog_comments.* TO comments@localhost;
```

If you're willing to migrate comments from another commenting system, take a look at the [migration guide](./migrate.md).

## Download and install JAMStack comments
For the exemple, we'll consider that you'll install JAMStack comments under `/var/www/comments/`.
So download this repo, unzip it and install the dependencies with `npm i`.

### Update `config.js`
By default, `config.js` is working for a local testing database with root user and no password, this is definitely not what you want!

Hence you need to update `config.js` with your own settings. For more info about possible settings for different DB engines, check out [Knex.js documentation](https://knexjs.org/#Installation-client).

Now to create the tables, just run `npm run createTables` and you're all set up.

### Create a service
Assuming you're using SytemD, here is a very succint service file. You should modify this according to your own settings, namely: `User`, `WorkingDirectory` and `ExecStart`.

```shell
# /etc/systemd/system/jamcomments.service

[Unit]
Description=JAMStack comments API
Documentation=https://github.com/Buzut/jamstack-comments

[Service]
User=www-data
WorkingDirectory=/var/www/comments/
Environment=PATH=/usr/bin:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /var/www/comments/server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Then reaload SystemD, make the service start on boot and start it:

```shell
systemctl daemon-reload
systemctl enable jamcomments
systemctl start jamcomments
```

### Configure the web server
Just pick the webserver you like. Exemple with Apache:

```shell
<VirtualHost comments.my-blog.net:443>
  Protocols h2 http/1.1
  ServerName comments.my-blog.net

  ServerAdmin my@email.net
  DocumentRoot /var/www/comments

  # HSTS
  Header always set Strict-Transport-Security "max-age=15768000"

  SSLEngine on
  SSLCertificateFile /etc/letsencrypt/live/comments.my-blog.net/cert.pem
  SSLCertificateKeyFile /etc/letsencrypt/live/comments.my-blog.net/privkey.pem
  SSLCertificateChainFile /etc/letsencrypt/live/comments.my-blog.net/chain.pem

  ErrorLog ${APACHE_LOG_DIR}/error.log

  Header always set Strict-Transport-Security "max-age=15768000"
  ProxyPass /article/ !
  ProxyPass "/" "http://localhost:8888/"

  <Directory /var/www/comments/article/>
     Options -Indexes +FollowSymLinks
     AllowOverride All
  </Directory>
</VirtualHost>
```

The only specific thing is to tell the webserver to proxy the requests to the app but to serve directly the generated JSON files.

### Connecting your website
It's a dead simple API.

Fetch comments by requesting the slug of your page with the JSON extension:

```javascript
// comments for page my-blog.net/i-love-jamstack/
function getComments(slug) {
    return fetch(url)
    .then((res) => {
        if (!res.ok) return Promise.reject(new Error(res.status));
        return res.json();
    });
}

// getting rid of starting and trailing slashes
const slug = window.location.pathname.replace(/^\/|\/$/g, '');

getJsonData(`https://comments.my-blog.net/article/${slug}.json`)
.then((comments) => {
    // whatever you wanna do with the comments
})
.catch(errorHandler);
```

Bear in mind that the comments you get from the API are raw, unsanitized comments, so be cautions, don't expose your users!

To post a comment, it's almost as simple:

```javascript
// 4 params are required
function postComment(body) {
    const formData = new FormData();
    Object.keys(body).forEach(key => formData.append(key, body[key]));

    return fetch(`${commentsBaseAddress}/comment/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData)
    })
    .then((res) => {
        if (!res.ok) return res.text().then((msg) => Promise.reject(new Error(msg)));
        return Promise.resolve();
    });
}

// now once you validated your comments and got the data
postComment({ slug, comment, name, email })
.then(() => {
    // comment submitted 🎉
    // [{ id: Number, parent_id: Number|Null, name: String, md5_email: String, submitted_at: String, comment: String }, …]
})
.catch((err) => {
    // something happened
});
```

Also, be aware that these exemples are not 100% compatible with all browsers. We here use the [*fetch API*](https://www.caniuse.com/#feat=fetch) and [*URLSearchParams*](https://www.caniuse.com/#feat=urlsearchparams) that, although well supported, won't work with older browsers.

You could instead use the more ubiquitous [XMLHTTPRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

## Contributing
There's sure room for improvement, so feel free to hack around and submit PRs!
Please just follow the style of the existing code, which is [Airbnb's style](http://airbnb.io/javascript/) with [minor modifications](.eslintrc).

To maintain things clear and visual, please follow the [git commit template](https://github.com/Buzut/git-emojis-hook).
