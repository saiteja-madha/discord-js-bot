# 🤖 Description
An awesome multipurpose discord bot built using discord.js

## Requirements
- Node.js 16.6.0 or newer
- npm installed

## 🚀 Getting Started
```
git clone https://github.com/saiteja-madha/discord-js-bot.git
cd discord-js-bot
npm install
```
After installation finishes use `node .` to start the bot

## ⚙️ Configuration
```
Rename ".env.example" to ".env" and fill the values
Optionally edit config.json
```

Property | Description | Optional
------------ | ------------- | -------------
`BOT_TOKEN` | Discord bot token from [here](https://discord.com/developers/applications) | ❌
`MONGO_CONNECTION` | Mongo Connection String URL | ❌
`WEATHERSTACK_KEY` | API to get weather data from [here](https://weatherstack.com/) | ✅
`JOIN_LEAVE_WEBHOOK` | Webhook URL to send guild join/leave details [here](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) | ✅

<br>

## 📝 Features & Commands

### 🛡 Auto Moderation
> - These commands can only be configured by members who have Permission.MANAGE_SERVER
> - The bot moderates messages only in channels where it has Permission.MESSAGE_MANAGE
> - The bot ignores messages sent by users having Permission.KICK_MEMBERS, Permission.BAN_MEMBERS, Permission.MANAGE_SERVER

Command | Description
------------ | -------------
`automodstatus` | check automod configuration for this guild
`automodlog <#channel\|OFF>` | set/disable logging for all automod events
`antiinvites <ON\|OFF>` | allow or disallow sending discord links in message
`antilinks <ON\|OFF>` | allow or disallow sending links in message
`maxlines <number\|OFF>` | sets maximum lines allowed per message
`maxmentions <number\|OFF>` | sets maximum user mentions allowed per message
`maxrolementions <number\|OFF>` | sets maximum role mentions allowed per message

### 🔨 Moderation Commands

Command | Description
------------ | -------------
`ban <@member(s)> [reason]` | Ban the the mentioned member(s)
`kick <@member(s)> [reason]` | Kick the mentioned member(s)
`mute <@member(s)> [reason]` | Mute the mentioned member(s) on all text/voice channels
`purgeattach <amount>` | Deletes the specified amount of messages with attachments
`purgebots <amount>` | Deletes the specified amount of messages from bots
`purge <amount>` | Deletes the specified amount of messages
`purgelinks <amount>` | Deletes the specified amount of messages with links
`purgeuser <@user> <amount>` | Deletes the specified amount of messages for the mentioned user
`softban <@member(s)> [reason]` | Kicks a member from the server and delete that users messages
`unmute <@member(s)> [reason]` | Unmutes the specified member(s)
`vunmute <@member(s)> [reason]` | UnMute voice of the mentioned member(s)

### 🛠 Utility Commands:

Command | Description
------------ | -------------
`covid <country>` | Get covid statistics in the specified country
`github <username>` | Shows github statistics of a user
`help <command>` | Shows the list with commands in the bot
`translate <code> <text>` | Translate from one language to other
`urban <search-term>` | Searches the urban dictionary
`proxies [proxy-type]` | Fetch fresh proxies (http, socks4, socks5)

### 😂 Fun Commands:

Command | Description
------------ | -------------
`cat` | Shows a random cat image
`dog` | Shows a random dog image
`flipcoin` | Flips a coin heads or tails
`fliptext` | Reverses the given message

### 🪧 Information Commands

Command | Description
------------ | -------------
`avatar [name\|id]` | Displays avatar information about the user
`botinfo` | Shows bot information
`channelinfo [#channel]` | Shows mentioned channel information
`guildinfo` | Shows information about the discord server
`botinvite` | Get the bot's invite
`ping` | Shows the current ping from the bot to the discord servers
`uptime` | Shows bot's uptime

### 🪙 Economy Commands

Command | Description
------------ | -------------
`balance [@member\|id]` | Shows your current coin balance
`daily` | Receive a daily coin bonus
`gamble <amount>` | Try your luck by gambling
`transfer <coins> <@member\|id>` | Transfer coins to other user

### 🫂 Social Commands

Command | Description
------------ | -------------
`-rep [@member\|id]` | Give reputation to a user

### 🖼 Image Commands

```Generators```
<table>
   <tr>
      <td>ad</td>
      <td>affect</td>
      <td>beautiful</td>
      <td>bobross</td>
      <td>color</td>
   </tr>
   <tr>
      <td>confusedstonk</td>
      <td>delete</td>
      <td>discordblack</td>
      <td>discordblue</td>
      <td>facepalm</td>
   </tr>
   <tr>
      <td>hitler</td>
      <td>jail</td>
      <td>jokeoverhead</td>
      <td>karaba</td>
      <td>mms</td>
   </tr>
   <tr>
      <td>notstonk</td>
      <td>poutine</td>
      <td>rainbow</td>
      <td>rip</td>
      <td>shit</td>
   </tr>
   <tr>
      <td>stonk</td>
      <td>tatoo</td>
      <td>thomas</td>
      <td>trash</td>
      <td>wanted</td>
   </tr>
   <tr>
      <td>wasted</td>
   </tr>
</table>

```filters```
<table>
   <tr>
      <td>blur</td>
      <td>burn</td>
      <td>gay</td>
      <td>greyscale</td>
   </tr>
   <tr>
      <td>invert</td>
      <td>pixelate</td>
      <td>sepia</td>
      <td>sharpen</td>
   </tr>
</table>

<br>

## 🤝 Contributing
Feel free to [Fork](https://github.com/saiteja-madha/discord-js-bot/fork) this repository, create a feature branch and submit a pull request
