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
Everything is cached by default. This means that when data is fetched, it is served straight from your webserver, without even hitting Jamments' API.

Cached files are updated only when data changes. No change, no update, no work.

## Spam control
The API is meant to be autonomous and doesn't relly on external APIs. The rationale for spam filtering is that spammers will basically enter fake emails.

Hence, for a comment to be validated, commenter will be sent an email with a validation link. The link contains information that must be sent back to the API in order to validate the comment.

On top of that, administrator can delete inapropriate comments.
