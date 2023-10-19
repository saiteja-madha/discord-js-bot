# Custom Domain

## 1. Domain Config <a href="#heading-1" id="heading-1"></a>

Go to your DNS Registrar - E.G Namecheap, Google Domains, Namecom etc....

For this example, I will be using [Cloudflare](https://dash.cloudflare.com/)

**Locate your DNS Records**

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1668104209190/mvCRkv8\_P.png?auto=compress,format\&format=webp)

***

**Add an "A Record" With the following information**

| Name                                   | IPV4 Adress              |
| -------------------------------------- | ------------------------ |
| Subdomain or @ to use the whole domain | your servers IPV4 Adress |

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1668104547518/QwVvKB-Ox.png?auto=compress,format\&format=webp)

***

## 2. Apache Config <a href="#heading-4" id="heading-4"></a>

SSH into the server running your HTTP website as a user with sudo privileges.

You will need to be able to access your servers terminal for these following steps

```bash
sudo apt update

sudo apt install apache2
```

**List the ufw application profiles by typing:**

```bash
sudo ufw app list
```

**You will receive a list of the application profiles:**

```bash
Output
Available applications:
  Apache
  Apache Full
  Apache Secure
  OpenSSH
```

As indicated by the output, there are three profiles available for Apache:

Apache: This profile opens only port 80 (normal, unencrypted web traffic)

Apache Full: This profile opens both port 80 (normal, unencrypted web traffic) and port 443 (TLS/SSL encrypted traffic)

Apache Secure: This profile opens only port 443 (TLS/SSL encrypted traffic)

***

### **Enable the following Apache Modules** <a href="#heading-5" id="heading-5"></a>

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_balancer
sudo a2enmod lbmethod_byrequests
```

**Restart Apache**

```bash
sudo systemctl restart apache2
```

## **Configuring our webserver** <a href="#heading-6" id="heading-6"></a>

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1668105558953/doaPFoXH\_.png?auto=compress,format\&format=webp)

```bash
cd /etc/apache2/sites-available
```

**Once you run `ls` you should see 000-default.conf**

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1668105642911/n\_ltZ0oTO.png?auto=compress,format\&format=webp)

**Copying the default configuration**

```bash
cp 000-default.conf dashboard.conf
nano dashboard.conf
```



**Edit the default configuration to the below configuration**

```bash
<VirtualHost *:80>
        # The ServerName directive sets the request scheme, hostname and port that
        # the server uses to identify itself. This is used when creating
        # redirection URLs. In the context of virtual hosts, the ServerName
        # specifies what hostname must appear in the request's Host: header to
        # match this virtual host. For the default virtual host (this file) this
        # value is not decisive as it is used as a last resort host regardless.
        # However, you must set it for any further virtual host explicitly.
        #ServerName www.example.com

        ServerName yourdomain.com
        ProxyRequests On
        ProxyPreserveHost On

        ProxyPass / http://localhost:8080/ # <-- Change the port if your bot is running on a different port
        ProxyPassReverse / http://localhost:8080/

        # Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
        # error, crit, alert, emerg.
        # It is also possible to configure the loglevel for particular
        # modules, e.g.
        #LogLevel info ssl:warn

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        # For most configuration files from conf-available/, which are
        # enabled or disabled at a global level, it is possible to
        # include a line for only one particular virtual host. For example the
        # following line enables the CGI configuration for this host only
        # after it has been globally disabled with "a2disconf".
        #Include conf-available/serve-cgi-bin.conf
</VirtualHost>
```

> Press `CTRL + X` or `Command-X` for Mac then press Enter to save changes

**Now run the following command**

```bash
a2ensite dashboard.conf
systemctl reload apache2
```

## 3. **Setting up our Discord application redirect** <a href="#heading-7" id="heading-7"></a>

Go to [discord.dev](https://discord.dev/) and go to your application **-**> Oauth2 -> General

Add 2 Redirects with the following contents

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1668812746494/UGjM9bOpl.png?auto=compress,format\&format=webp)

**important -> Change http and https depending if you have SSL or not!**

Now you should be able to access and login to your bots dashboard!

***

\
