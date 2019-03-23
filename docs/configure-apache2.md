# Configure Apache2
With Nginx, Apache2 is one the most widespread webserver. Let's see how to configure it to directly serve cached files while reverse-proxying write requests.

Apache website configuration files are usually placed in `/etc/apache2/sites-available/`. So let's create a new one named `jamments.my-blog.conf`.

```
# Redirect HTTP to HTTPS
<VirtualHost comments.my-blog.net:80>
  ServerAdmin qbusuttil@buzeo.me
  Redirect permanent / https://comments.my-blog.net/
</VirtualHost>

<VirtualHost comments.my-blog.net:443>
  Protocols h2 http/1.1
  ServerName comments.my-blog.net

  ServerAdmin my@email.net
  DocumentRoot /var/www/jamments

  # HSTS
  Header always set Strict-Transport-Security "max-age=15768000"

  # TLS config for HTTPS
  SSLEngine on
  SSLCertificateFile /etc/letsencrypt/live/comments.my-blog.net/cert.pem
  SSLCertificateKeyFile /etc/letsencrypt/live/comments.my-blog.net/privkey.pem
  SSLCertificateChainFile /etc/letsencrypt/live/comments.my-blog.net/chain.pem

  # Configure CORS policy
  # Authorize your website to make AJAX request (you can auth several websites)
  Header always set Access-Control-Allow-Origin "https://my-blog.net"
  Header always set Access-Control-Allow-Methods "POST, GET, OPTIONS, DELETE, PUT"
  Header always set Access-Control-Max-Age 86400
  Header always set Access-Control-Allow-Headers "x-requested-with, Content-Type, origin, authorization, accept, client-security-token"
  Header always set Access-Control-Expose-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization"

  # This is important to handle pre-flight requests (the app in itself has no knowledge of CORS)
  RewriteEngine On
  RewriteCond %{REQUEST_METHOD} OPTIONS
  RewriteRule ^(.*)$ $1 [R=200,L]

  # Set up reverse proxy but directly serve cached files from article and infos directories
  ProxyPass /article/ !
  ProxyPass /infos/ !
  ProxyPass "/" "http://localhost:8888/"

  # Disallow directory index and don't interpret .htaccess
  <Directory /var/www/jamments/article/>
     Options -Indexes
     AllowOverride None
  </Directory>
</VirtualHost>
```

You might note that we used TLS certificates provided by Let's Encrypt. While HTTPS in not a requirement, it's strongly advised. You're free to choose whatever provider you might want. Let's Encrypt being free and scriptable, it's ubiquitous today on the web.

We won't cover certificate generation, but head to [Certbot's website](https://certbot.eff.org/) (Let's Encrypt official client) for more infos on the matter.
