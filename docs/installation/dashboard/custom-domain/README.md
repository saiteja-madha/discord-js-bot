# Custom Domain

## 1. Domain Config <a href="#heading-1" id="heading-1"></a>

Go to your DNS Registrar - E.G, Namecheap, Google Domains, Namecom, etc...

For this example, I will be using [Cloudflare](https://dash.cloudflare.com/).

**Locate your DNS Records**

<figure><img src="../../../.gitbook/assets/image (2).png" alt=""><figcaption><p>locate your DNS Records</p></figcaption></figure>

***

**Add an "A Record" With the following information**

| Name                                   | IPV4 Adress              |
| -------------------------------------- | ------------------------ |
| Subdomain or @ to use the whole domain | your servers IPV4 Adress |

<figure><img src="../../../.gitbook/assets/image (3).png" alt=""><figcaption></figcaption></figure>

***

## 2. Apache Config <a href="#heading-4" id="heading-4"></a>

SSH into the server running your HTTP website as a user with sudo privileges.

You will need to be able to access your server's terminal for these following steps.

```bash
sudo apt update && sudo apt upgrade -y

sudo apt install apache2
```

**List the ufw application profiles by typing:**

```bash
sudo ufw app list
```

**You will receive a list of the application profiles:**

<figure><img src="../../../.gitbook/assets/image (6).png" alt=""><figcaption></figcaption></figure>

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

```bash
cd /etc/apache2/sites-available
```

**Once you run `ls` you should see 000-default.conf and any other available configs**

<figure><img src="../../../.gitbook/assets/image (7).png" alt=""><figcaption></figcaption></figure>

**Copying the default configuration**

```bash
sudo cp 000-default.conf dashboard.conf
sudo nano dashboard.conf
```

**Edit the default configuration to the below configuration**

```bash
  GNU nano 7.2                                                   dashboard.conf                                                             
<VirtualHost *:80>
        # The ServerName directive sets the request scheme, hostname and port that
        # the server uses to identify itself. This is used when creating
        # redirection URLs. In the context of virtual hosts, the ServerName
        # specifies what hostname must appear in the request's Host: header to
        # match this virtual host. For the default virtual host (this file) this
        # value is not decisive as it is used as a last resort host regardless.
        # However, you must set it for any further virtual host explicitly.
        #ServerName www.example.com

        ServerName amina.vikshan.me
        ProxyRequests On
        ProxyPreserveHost On

        ProxyPass / http://localhost:8080/
        # <-- Change the port if your bot is running on a different port
        ProxyPassReverse / http://localhost:8080/

        # ServerAdmin webmaster@localhost
        # DocumentRoot /var/www/html

        # Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
        # error, crit, alert, emerg.
        # It is also possible to configure the loglevel for particular
        # modules, e.g.
        #LogLevel info ssl:warn

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
```

> Press `CTRL + X` or `Command-X` for Mac, then press `Enter` to save changes.

**Now run the following command.**

```bash
sudo a2ensite dashboard.conf
sudo systemctl reload apache2
```

## 3. **Setting up our Discord application redirect** <a href="#heading-7" id="heading-7"></a>

Go to [Discord Dev](https://facebook.com/developers/applications) and go to your application **-**> Oauth2 -> General.

Add 2 Redirects to your dashboard.

<figure><img src="../../../.gitbook/assets/image (8).png" alt=""><figcaption></figcaption></figure>

{% hint style="danger" %}
**Change http and https depending on whether you have SSL or not!**
{% endhint %}

Now, you should be able to access and log in to your bot's dashboard!

***

[![ko-fi](https://ko-fi.com/img/githubbutton\_sm.svg)](https://ko-fi.com/vikshan)

***
