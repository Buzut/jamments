# Install Jamments
Go to the [Github repo](https://github.com/Buzut/jamments) and get the lastest release. Unzip it and place it under your webserver's directoy (usually `/var/www/`).

**Hint:** *You can download with `wget` and unzip using `unzip` on almost all Linux distros*.

For the exemples below, let's say we downloaded and unzipped our directory and it now sits at `/var/www/jamments/`.

### Dependencies
First thing you have to do is install the dependencies:

```
# go to the repository
cd /var/www/jamments

# and install all the required dependencies
npm i
```

## Configure
Now all you have to do is to rename (or copy) the `config.dist.js` into `config.js`.

As you can see, there are a bunch of options. The most important ones are:
* `siteUrl`
* `adminEmail`
* `db`
* `email`

They should be self explanatory. You can head to [configuration file](config-file.md) for more details about the configuration options.

`db` and `email` config objects depend on your actual settings (database and email provider). As these config objects are passed as is to their respective libraries, you'd better check directly their respective documentations for more in depth infos.

* [Database library](https://knexjs.org/)
* [SMTP library](https://github.com/eleith/emailjs)

To make sure you email configuration is functional, you can use the `sendTestEmail.js` file. Just fill in your information and execute it with `node sendTestEmail.js`. You should receive the email or get an error.

### Owner and rights
Now that your config is good, set up the owner to allow Jamments to work correctly (it'll need to be able to write cache files in its directory). The easier solution is to make Jamment's user the owner of its directory `chown -R www-data /var/www/jamments`. Usually, Jamment's user is the same as the webserver (hence `www-data` or `www` depending on the OS).

You'll define the user Jamments runs when you configure Systemd.

### Create tables
Now to create the tables, from the project directory, just run `npm run createTables` and you're all set up.

You now should be able to start the API with `npm start`. Nevertheless, what you might want is to have a dæmon that automatically starts on boot and a webserver to handle incoming requests on port 443 (or 80).

Let's start with [Systemd](configure-systemd.md).
