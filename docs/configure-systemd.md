# Configure Systemd
While Systemd is not the only service manager out there, it's the most widespread. We're going to cover Systemd, but there is no reason not using your system of choice here (and if you want to add it to the docs, feel free to PR!).

## Create a service
Systemd files live under `/etc/systemd/system/` and end with `.service` extension when they are services.

We're placing our into `/etc/systemd/system/jamments.service`. Here is a very succint service file. You should modify this according to your own settings, namely: `User`, `WorkingDirectory` and `ExecStart`.

Note that `User` is generally the same user as your webserver.

```
# /etc/systemd/system/jamcomments.service

[Unit]
Description=JAMStack comments API
Documentation=https://github.com/Buzut/jamments

[Service]
User=www-data
WorkingDirectory=/var/www/jamments/
Environment=PATH=/usr/bin:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /var/www/jamments/server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Then reaload Systemd, make the service start on boot and start it:

```shell
systemctl daemon-reload
systemctl enable jamcomments
systemctl start jamcomments
```

You're now all good.
