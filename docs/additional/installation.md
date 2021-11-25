# ✍ Guides

### Setting up Slash Commands

* Slash commands are disabled by default
* In the **config.js** set **SLASH = true** and **CONTEXT = true** and replace TEST\_GUILD\_ID with the guild ID where you want to initially test the commands. This will ensure that all the commands are registered immediately
* Once you are happy with the commands, set **GLOBAL = true** to register these interactions globally

{% hint style="warning" %}
_**Global slash commands** can take upto 1 hour to be shown across all guilds_
{% endhint %}

### Setting up Dashboard

* In the config.js, make sure you set dashboard enabled to **true**
* Add your baseURL, `http://localhost:8080/api/callback` in your application OAuth2 redirects page in the [discord developer portal](https://discord.com/developers/applications)

```
  DASHBOARD: {
    enabled: true, // enable or disable dashboard
    baseURL: "http://localhost:8080", // base url
    failureURL: "http://localhost:8080", // failure redirect url
    port: "8080", // port to run the bot on
  },
```
