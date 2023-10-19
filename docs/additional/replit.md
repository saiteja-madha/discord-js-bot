# Running The Bot On Replit
This guide will show you how to run the bot on replit.

## Step 1: Forking The Repository
First, you need to fork the repository. To do this, you can either:

- You can try to fork the [replit here](https://replit.com/@vikshan/mochi)
- Or you can fork the repository on GitHub and then import it to replit.
- Click on the `Import from GitHub` button and paste the URL of the repository.

## Step 2: Setting Up The Run Command
There are two ways to run the bot correctly.

### Option 1: Typing the start command in the terminal
You can run the bot by typing the following command in the terminal:
```bash
node .
```
Or 
```bash
npm run start-replit
```
Otherwise the bot will default to the `start` script in the `package.json` file if you press the start button, which is:
```json
"start": "pm2 start ./lib/index.js --name mochi && pm2 save && pm2 logs",
```
### Option 2: Using the start Button
Typing the command in the terminal is a bit tedious, so you can use the start button instead. To do this; 
- While forking the repl, you can paste one of the [above commands](#option-1-typing-the-start-command-in-the-terminal) in the start command box.
- Or you can go to the `package.json` file and change the start script as follows:

```json
"start": "node index.js",
```
>Make sure you do not commit this change to the GitHub repository, otherwise this will change how the bot works on your local machine after you pull the changes. You can use the `git update-index --assume-unchanged package.json` command to ignore the changes to the `package.json` file.<br>
If you wish to commit the changes, always make sure to change the start script based on your environment.

## Step 3: Setting Up The Environment Variables
You need to set up the environment variables. To do this, go to the `secrets` tab and add the following environment discused in the [installation.md](./installation.md#setting-up-environment-variables)

## Running the Bot 24/7
Docs coming soon.

## Troubleshooting
Everything should be working now. If you have any issues, feel free to open an issue or join the [Discord server](https://discord.gg/uMgS9evnmv).

## <img src="https://cdn.discordapp.com/emojis/1036083490292244493.png" width="15px" height="15px">》Support Server
[![DiscordBanner](https://invidget.switchblade.xyz/uMgS9evnmv)](https://discord.gg/uMgS9evnmv)

[Support Server](https://discord.gg/uMgS9evnmv) - Mochi's Support Server Invite