# Guide to importing WordPress comments to JAMstack comments

I'd recommand dumping your WordPress database and do all the manipulation on a dev database (your laptop should do!).

## Dealing with time
We are going to convert [DATETIME](https://mariadb.com/kb/en/library/datetime/) to [TIMESTAMP](https://mariadb.com/kb/en/library/timestamp/).

What is nice with TIMESTAMP is that it stores date and time as a UNIX TIMESTAMP. Therefore, there is no need to worry about the server (both OS and MySQL) timezone settings.

In addition, we get back a timezone free value, hence it's easier to convert it to the reader's local time, the browser's [Date object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) will happily deal with it.

On top of that, it's super easy to get human friendly formatted dates thanks to [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) and even relative dates with [humanTime](https://github.com/Buzut/humantime) (full dislosure: I wrote this module).

### Special care
DATETIME is completely ignorant of timezones. So when converting your database to its new format, make sure the server is configured on the same timezone as the one that this WordPress instance was running on.

For instance, my server is in CET, and I dumped the database to import it on my laptop – which at the time of import was on EST (6 hours less!).

If not setting MySQL properly, on import, all the TIMESTAMPS would be considered to have been generated on CET. Therefore a comment posted at 6pm  Paris time would be considered to have been posted at 6pm New York time… Not ideal.

Check out what your server config is:

```sql
SELECT @@global.time_zone, @@session.time_zone;
+--------------------+---------------------+
| @@global.time_zone | @@session.time_zone |
+--------------------+---------------------+
| SYSTEM             | SYSTEM              |
+--------------------+---------------------+
```

MySQL states here that it uses the time provided by the OS. So let's check this:

```shell
date
Jeu  7 mar 2019 20:25:07 EST
```

Not matching. So I stop the MySQL server (local machine, there's no impact here), update the session timezone and start it again.

```shell
mysqld stop
export TZ=Europe/Paris

# let's check
date
Ven  8 mar 2019 02:29:43 CET


mysqld start
```

I'd recommand using Europe/Paris or whatever timezone you are in, at least it will handle daylight savings automatically (CEST in summer in France for instance).

## Remove WordPress spam comments

```sql
DELETE FROM wp_comments WHERE comment_approved = 'spam';
```

## Create new database for JAMstack comments

You need to manually create the database.

```sql
CREATE DATABASE blog_comments DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
```

Now you should be able to execute the migration script. You have to set the config.js and the `wpDbConf` object in `migrateWordPress.js`.

This script is quick and dirty. It actually doesn't import relations between threaded comments.

I'm pretty sure there is a better way, especially through the WordPress API that could be directly interfaced with JAMstack comments' API. This would be way better and more future proof. If you have time to tackle this, please PR!
