## 🚀 Setup

- You can see the [Replit installation guide here](./replit.md)

- Or you can set it up on your machine.


- ## <img src="https://cdn.discordapp.com/emojis/1009754836314628146.gif" width="25px" height="25px">》Requirements
- [Git](https://git-scm.com/downloads)
- [MongoDB](https://www.mongodb.com)
- [Nodejs](https://nodejs.org/en/): (18 or above)
- Java v13 for lavalink server.
- [pm2](https://pm2.io/docs/runtime/guide/installation/): To keep your bot alive 24/7
- Discord Token. Get it from [Discord Developers Portal](https://discord.com/developers/applications)
- Mongo Database URL. Get it from [MongoDB](https://cloud.mongodb.com/v2/635277bf9f5c7b5620db28a4#clusters)
- Giphy API Token. Get it from [Giphy Developers Portal](https://developers.giphy.com/)
- OpenAI API Key `for ai chatbot`. Get it from [OpenAi Developers Portal](https://beta.openai.com/account/api-keys)
- ClientID `for loading slash commands.`
- Spotify client ID `for spotify support` [Click here to get](https://developer.spotify.com/dashboard/login)
- Spotify client Secret `for spotify support` [Click here to get](https://developer.spotify.com/dashboard/login)

## Creating a Discord Bot
Please set up a discord bot [here](https://discord.com/developers/applications/) and add it to your server.

Scopes:
- bot
- application.commands

Bot Permissions:
- read messages/view channels
- send messages
- create public threads
- create private threads
- send messages in threads
- embed links
- attach files
- use slash commands

You also need to enable the Message Content Intent:

<details>
<summary>Expand to see image</summary>

![image](https://user-images.githubusercontent.com/108406948/210853245-31728f5a-3017-4a26-9caa-0541b6fe1aae.png)

</details>


## <img src="https://cdn.discordapp.com/emojis/814216203466965052.png" width="25px" height="25px">》Installation Guide

### <img src="https://cdn.discordapp.com/emojis/1028680849195020308.png" width="15px" height="15px"> Installing via [NPM](https://www.npmjs.com/)


- Clone the repo and install dependancies by running
```bash
git clone https://github.com/vixshan/mochi.git
cd mochi
npm install
```
- After cloning Fill all requirement in `.env` **(rename `.env.example` to `.env`)**

## Setting up Environment Variables

The following environment variables are required for mochi to work correctly.

You can set the environment variables in any way you like or place a .env file at the root of your project (rename `.env.example` to `.env`),
Ensure that your `.env` looks like this:
<details>
  <summary> [EXPAND] Click to see .env</summary>
  
```bash
@@ -1,23 +0,0 @@
# Bot Token [Required]
BOT_TOKEN=

# Mongo Database Connection String [Required]
MONGO_CONNECTION=

# Webhooks [Optional]
ERROR_LOGS=
JOIN_LEAVE_LOGS=

# Dashboard [Required for dashboard]
BOT_SECRET=
SESSION_PASSWORD=

# Required for Weather Command (https://weatherstack.com)
WEATHERSTACK_KEY=

# Required for image commands (https://strangeapi.fun/docs)
STRANGE_API_KEY=

# SPOTFIY [Required for Spotify Support]
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

# Required for OpenAI (https://beta.openai.com/)
OPENAI=

# Required for few anime commands (https://docs.waifu.it)
WAIFU_IT_KEY=

```


MongoDB:
- MONGODB_CONNECTION: The MongoDB connection string.
  - Should look something like this: mongodb+srv://<username>:<password><cluster>.<something>.mongodb.net/?retryWrites=true&w=majority

Bot Token:
- BOT_TOKEN: The Discord bot token
  - You can get it from your [Discord Dev Portal](https://discord.com/developers/applications) by selecting your app and then selecting "Bot."

Discord Server Details:
- ERROR_LOGS: (Optional) The webhook for error log messages
- JOIN_LEAVE_LOGS: (Optional) The webhook for join/leave log messages

Extras:
- WEATHERSTACK_KEY: (Optional) The API key for weatherstack.com
- STRANGE_API_KEY: (Optional) The API key for strangeapi.fun
- SPOTIFY_CLIENT_ID: (Optional) The client ID for Spotify
- SPOTIFY_CLIENT_SECRET: (Optional) The client secret for Spotify
- OPENAI: (Optional) The API key for OpenAI
- WAIFU_IT_KEY: (Optional) The API key for [waifu.it](https://docs.waifu.it)
</details>

## Start your bot
Set up the environment variables as described above.

- Install pm2 globally by running 
```js
npm i -g pm2
```
- Start the bot
```bash
npm start
```

>You can also run `npm run start` to start the bot.

- NOTE: running `npm start` or `npm run start` will start the bot with PM2 and give it the name "mochi." You can replace "mochi" with a name of your choice in [package.json](./package.json). It will also show logs for the bot and save the pm2 processes.

<details>
<summary> [EXPAND] COMMON ERRORS </summary>
  
```js
[PM2][ERROR] Script already launched, add -f option to force re-execution
```
>It means that the bot is already running. You can delete it by running the following command followed by the command to start the bot, i.e., `npm run start`:
```
pm2 delete mochi
```
> Or restart it by running:
```
pm2 restart mochi
```

</details>

- If you are in a dev environment, use `node .` or `npm run dev` to test your code:
```
node .
```
Once you are satisfied with the changes, run the following:
```
pm2 restart mochi && pm2 logs
```
You can also restart it from the [pm2.io dashboard](https://pm2.io/) as shown bellow:
<details>
<summary>Expand to see image</summary>

![image](https://cdn.discordapp.com/attachments/1072834906742345808/1076183450417123358/image.png)

</details>



# <img src="https://cdn.discordapp.com/emojis/1015745034076819516.png" width="25px" height="25px">》MISCELLANEOUS

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
