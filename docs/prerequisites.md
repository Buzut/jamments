# Prerequisites
You'll need a server to a hosting environment that supports Node.js.
The production environment requires the following stack:
* Node.js (v8+) & npm
* A webserver (Apache2, Nginx…)
* A supported database (SQLite, MySQL, MariaDB, PostgreSQL, MSSQL)
* Systemd
* A registered domain name

## Node.js & npm
On most Linux distros, you should be able to install Node straight from your package manager. Nevertheless, it might be to old of a version (Ubuntu < 18.04 for instance).

In this case you'd better install Node by following the instructions on the [official documentation](https://nodejs.org/en/).

## Database
We won't detail here how to install the database itself. I'm pretty confident you know how to do that. Let's log into the SQL CLI and create our database and user.

_Exemples below are MySQL but as it's standard SQL, it should be the same or almost the same for other DB engines._

You need to manually create the database before everything. You're free to choose your database name (here `blog_comments`) and your database user (here `comments`).

Also don't forget to replace `YOUR PASSWD` by your actual password 😉

```
CREATE DATABASE blog_comments DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- dedicated user could be a good thing too
CREATE USER comments@localhost IDENTIFIED BY 'YOUR PASSWD';

-- and define rights
GRANT ALL PRIVILEGES ON blog_comments.* TO comments@localhost;
```

You could actually have more restrictive rights, but you'll have to [create the tables manually](https://github.com/Buzut/jamments/blob/master/tables.sql) with a more privileged user.

```
GRANT SELECT, UPDATE, DELETE ON blog_comments.* TO comments@localhost;
```

If you're willing to migrate comments from another commenting system, take a look at the [migration guide](/migrate.md).
