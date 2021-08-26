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
- Rename config-sample.js to config.js and fill the values
- After installation finishes use `node .` to start the bot

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

### 🎫 Ticket Commands
```
Commands marked * can be used in ticket channel only
```
Command | Description
------------ | -------------
`ticket setup` | start an interactive ticket setup
`ticket log <#channel>` | setup log channel for tickets
`ticket limit <number>` | set maximum number of concurrent open tickets
`ticket close` | close the ticket*
`ticket closeall` | close all open tickets
`ticket add <userId\|roleId>` | add user/role to the ticket*
`ticket remove <userId\|roleId>` | remove user/role from the ticket*

### 📨 Invite Commands
Invite tracking must be enabled for most of the commands to work 
```
!invitetracking ON 
``` 
Command | Description
------------ | -------------
`inviter [@member\|id]` | shows inviter information
`invites [@member\|id]` | shows number of invites in this server
`addinvites [@member\|id] <invites>` | add invites to a member
`clearinvites [@member\|id]` | clear a users added invites
`invitecodes [@member\|id]` | list of invites codes in this guild
`invitesimport [@member\|id]` | add existing guild invites to users or all members
`inviteranks` | shows the invite ranks configured on this guild
`addinviterank <role-name> <invites>` | add auto-rank after reaching a particular number of invites
`reminviterank <role-name>` | remove invite rank configured with that role
`invitetracking <ON\|OFF>` | remove invite rank configured with that role

### 📨 Greeting Commands

Replace `cmd` with `welcome` for setting up welcome message and `farewell` for setting up farewell message<br>

Command | Description
------------ | -------------
`cmd [#channel\|off]` | enable or disable greeting message
`cmd preview` | preview the configured greeting message
`cmd desc <text>` | set embed description
`cmd thumbnail <ON\|OFF>` | enable/disable embed thumbnail
`cmd color <hexcolor>` | set embed color
`cmd footer <text>` | set embed footer content

Replacements
```
\n : New Line
{server} : Server Name
{count} : Server member count
{member:name} : Member Name
{member:tag} : Member Tag
{inviter:name} : Inviter Name
{inviter:tag} : Inviter Tag
{invites} : Inviter Invites
``` 

### Admin Commands

Command | Description
------------ | -------------
`setprefix <new-prefix>` | sets a new prefix for this server
`xpsystem <ON\|OFF>` | enable or disable XP ranking system in the server
`counter <type> <name>` | setup counter channel in the guild. Counter types: `all/members/bots`
`addrr <#channel> <messageid> <emote> <role>` | setup reaction role for the specified message
`removerr <#channel> <messageid>` | remove configured reaction for the specified message


## 🤝 Contributing
Feel free to [Fork](https://github.com/saiteja-madha/discord-js-bot/fork) this repository, create a feature branch and submit a pull request
