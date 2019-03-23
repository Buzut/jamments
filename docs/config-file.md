# Configuration file
The options in the [configuration file](https://github.com/Buzut/jamments/blob/master/config.dist.js) should be self explanatory (most of them are commented). Let's try to clarify some of them.


* `siteUrl` is the base url of your website, not the comments subdomain (or domain). It will be used in all sent emails.
* `adminEmail`: admin notifications will be sent to this email. Also, when you validate one of your own comments, if the commenting email matches this one, you'll be considered as admin. Therefore the API will accept `PATH` and `DELETE` request on comments that you don't own if you send the `user_secret` (see API for more details) matching this email.
* `userCanDeleteComments` allows user to delete their own comments.
* `db`: as already stated, Jamments uses Knex.js for database operations. Hence, for more details on the config options, you should check out [Knex.js](https://knexjs.org/) website directly.
* `db.usersTable`, `db.articlesTable`, `db.commentsTable` and `db.notificationsTable` are the names of the tables used internally. There is no reason to change this… But you still can if that's what you want.
* `email` contain smtp parameters used to connect to an external provider. [emailjs](https://github.com/eleith/emailjs) is used to handle the task. So feel free to check out their docs if you need more infos.
    * `senderAddr` is the email address used in the `FROM` field of the email, allowed formats are `hello@my-blog.net`  and `Buzut <hello@my-blog.net>`.
    * Texts referenced in `email` are freely editable. `%name%` and `%link%` will be replaced by their respective values. At the moment, emails are text only (but that is something that should evolve in the future).
    * `linkValidationAddrIsCommentPage`: if set to `false`, the link will direct to the website's homepage instead of the article page the comment was posted on.
    * `linkValidationAddrTrailingSlash`: if `true` a trailing slash is added at the end of the link before get params. Exemple: `https://my-blog.net/?…` if `false` this would be `https://my-blog.net?…`. This is important because if it doesn't match your website configuration and user is redirected, get parameters could be lost and user will never be able to confirm whatever action he must confirm (confirm comment for instance).
* `cacheDirs` contain all the configuration for cached files. There is no reason to modify this. Again, you're still free to do so. In case you'd want to do it, you'll have to create the directories before restarting the API. Also don't forget to configure your webserver accordingly.
* `appLogFile` is where the logs are sent. If you want to send them to `/var/log/x`, don't forget to authorize the Jamments to do so by setting it as the owner of the log file.
* `port` is the port Jamments will listen on. If this port is already taken by another app, you can change it to whatever unpriviledged port. Set your reverse proxy accordingly.
