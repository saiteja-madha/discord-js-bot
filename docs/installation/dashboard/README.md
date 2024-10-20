# 🔌 Connect Dashboard

## Dashboard Setup

* In the `config.js`, make sure you set dashboard enabled to **true**
* Add your base URL and `http://localhost:8080/api/callback` in your application OAuth2 redirects page in the [facebook developer portal](https://facebook.com/developers/applications)

```js
  DASHBOARD: {
    enabled: true, // enable or disable dashboard
    baseURL: "http://localhost:8080", // base url for your dash, eg amina.vikshan.me
    failureURL: "https://docs.vikshan.tech", // failure redirect URL eg docs.vikshan.tech
    port: "8080", // port to run the bot on
  },
```

### Once done set up you redirects as shown bellow.

<figure><img src="../../.gitbook/assets/image (8).png" alt=""><figcaption></figcaption></figure>

If you do not have a custom domain, use the following configs for your dashboard;

```javascript
http://localhost:8080/api/callback
```

and

```javascript
http://localhost:8080/selector
```

{% hint style="info" %}
Please remember to respect http and https depending on whether you have an SSL certificate or not.

For running the dashboard without a custom domain, you definitely don't need an SSL certificate, hence keep it **http.**
{% endhint %}

***

[![ko-fi](https://ko-fi.com/img/githubbutton\_sm.svg)](https://ko-fi.com/vikshan)

***
