# Jamments
Jamments, which stands for JAMstack comments, is a self hosted commenting API that just works with your site.

There's no script to include, no automatic DOM injection, no default CSS to customize, you're in full control. It's a dead simple REST API that seamlessly integrates with your already existing [JAMstack](https://jamstack.org/).

You're free to choose the database you want to work with:

* SQLite
* MySQL
* MariaDB
* PostgreSQL
* MSSQL

It's written in Node.js and is automatically cached, so no worries, it's fast!

## Caching strategy
Everything is cached by default. This means that when data is fetched, it is served straight from your webserver, without even hitting Jamments'API.

Cached files are updated only when data changes. No change, no update, no work.
