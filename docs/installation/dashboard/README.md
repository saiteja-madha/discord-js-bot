# 🔌 Connect Dashboard

## Dashboard Setup

* In the `config.js`, make sure you set dashboard enabled to **true**
* Add your base URL and `http://localhost:8080/api/callback` in your application OAuth2 redirects page in the [discord developer portal](https://discord.com/developers/applications)

```js
  DASHBOARD: {
    enabled: true, // enable or disable dashboard
    baseURL: "http://localhost:8080", // base url
    failureURL: "http://localhost:8080", // failure redirect URL
    port: "8080", // port to run the bot on
  },
```

## 》Support Server

<figure><img src="https://invidget.switchblade.xyz/uMgS9evnmv" alt=""><figcaption></figcaption></figure>
