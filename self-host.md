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

## Setup

- You can see the [Replit installation guide here](./replit.md)

- Or you can set it up on your machine.

### 📦 Prerequisites:

- [Nodejs](https://nodejs.org/en/): (18 or above)

- [Git](https://git-scm.com/downloads)

- [MongoDB](https://www.mongodb.com)

- [pm2](https://pm2.io/docs/runtime/guide/installation/): To keep your bot alive 24/7

## 🚀 Setup
- Clone the project:

```bash
git clone https://github.com/vixshan/mochi.git
cd mochi
```
(in windows, right-click somewhere in the folder and select "Open In Terminal")
if you see something about PowerShell, type `cmd` and hit enter to go to the more spartan command line terminal.

- Install dependencies:

```bash
npm install
```

If you need any additional help setting up the dashboard, make sure to read our guides [here](./README.md##-dashboard-setup)

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
</details>


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

## Start your bot
Set up the environment variables as described above.
- Install pm2:

With npm:

```bash
npm install pm2 -g
```

With yarn:

```bash
yarn global add pm2
```

With Debian, use the install script:

```bash
apt update && apt install sudo curl && curl -sL https://raw.githubusercontent.com/Unitech/pm2/master/packager/setup.deb.sh | sudo -E bash -
```
- Then, to start the bot, run:

```bash
npm start
```

>You can also run `npm run start` to start the bot.

- NOTE: running `npm start` or `npm run start` will start the bot with PM2 and give it the name "mochi." You can replace "mochi" with a name of your choice in [package.json](./package.json). It will also show logs for the bot and save the pm2 processes.
>NOTE: If you get the error:
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

## Extra Setup

### Setting up Slash Commands

- Slash commands are disabled by default
- In the [**config.js**](./config.js), set **`SLASH = true`** and **`CONTEXT = true`** and replace `TEST_GUILD_ID` with the guild ID where you want to test the commands initially. This will ensure that all the commands are registered immediately
- Once you are happy with the commands, set **`GLOBAL = true`** to register these interactions globally

>**Global slash commands** can take up to 1 hour to be shown across all guilds. You can use the `m!reload` command to sync the commands across all guilds. This will also update the commands if you have made any changes.
