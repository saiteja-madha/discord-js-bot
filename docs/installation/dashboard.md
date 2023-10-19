# <img src="https://cdn.discordapp.com/emojis/1015745034076819516.png" width="25px" height="25px">》

## Dashboard Setup

- In the config.js, make sure you set dashboard enabled to **true**
- Add your base URL and `http://localhost:8080/api/callback` in your application OAuth2 redirects page in the [discord developer portal](https://discord.com/developers/applications)

```js
  DASHBOARD: {
    enabled: true, // enable or disable dashboard
    baseURL: "http://localhost:8080", // base url
    failureURL: "http://localhost:8080", // failure redirect URL
    port: "8080", // port to run the bot on
  },
```
- To run your dashboard on your domain, follow this guide [🔌 | Connect Dashboard - DJS Bot - Ubuntu - Apache](https://blog.riverdev.wtf/connect-dashboard-djs-bot-ubuntu-apache) by [River](https://github.com/River198) or view this [discussion](https://github.com/Androz2091/AtlantaBot/discussions/371),

#### Auto-restarting your bot on git pull
- Add your GitHub repository as the remote origin:

```
git init
git remote add origin https://github.com/vixshan/mochi.git
```
- Create a new file in the hooks directory of your Git repository:
```
nano .git/hooks/post-merge
```
- Add the following code to the post-merge file:
```
#!/bin/sh
# pull the latest changes from GitHub
git pull origin master
# restart the bot using PM2
pm2 restart mochi
```
Save and close the file.

- Make the file executable:
```
chmod +x .git/hooks/post-merge
```
Every time you run `git pull`, it will automatically run the post-merge hook and pull the latest changes from your GitHub repository. The bot will also be restarted automatically using PM2.

>NOTE:<br>
If you want to use `git pull` to update your code automatically, you must keep your GitHub repository public. If you're going to keep your code private, consider using a different method, such as deploying from your machine or using a continuous integration/continuous delivery (CI/CD) tool such as Jenkins, TravisCI, CircleCI, etc. These tools allow you to securely deploy code from a private repository without exposing it publicly.

### Setting up Slash Commands

- Slash commands are disabled by default
- In the [**config.js**](./config.js), set **`SLASH = true`** and **`CONTEXT = true`** and replace `TEST_GUILD_ID` with the guild ID where you want to test the commands initially. This will ensure that all the commands are registered immediately
- Once you are happy with the commands, set **`GLOBAL = true`** to register these interactions globally

>**Global slash commands** can take up to 1 hour to be shown across all guilds. You can use the `m!reload` command to sync the commands across all guilds. This will also update the commands if you have made any changes.


## <img src="https://cdn.discordapp.com/emojis/1036083490292244493.png" width="15px" height="15px">》Support Server
[![DiscordBanner](https://invidget.switchblade.xyz/uMgS9evnmv)](https://discord.gg/uMgS9evnmv)

[Support Server](https://discord.gg/uMgS9evnmv) - Mochi's Support Server Invite
