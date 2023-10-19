# 📚 Miscellaneous

## Auto-restarting your bot on git pull

* Add your GitHub repository as the remote origin:

```
git init
git remote add origin https://github.com/vixshan/mochi.git
```

* Create a new file in the hooks directory of your Git repository:

```
nano .git/hooks/post-merge
```

* Add the following code to the post-merge file:

```
#!/bin/sh
# pull the latest changes from GitHub
git pull origin master
# restart the bot using PM2
pm2 restart mochi
```

Save and close the file.

* Make the file executable:

```
chmod +x .git/hooks/post-merge
```

Every time you run `git pull`, it will automatically run the post-merge hook and pull the latest changes from your GitHub repository. The bot will also be restarted automatically using PM2.

> NOTE:\
> If you want to use `git pull` to update your code automatically, you must keep your GitHub repository public. If you're going to keep your code private, consider using a different method, such as deploying from your machine or using a continuous integration/continuous delivery (CI/CD) tool such as Jenkins, TravisCI, CircleCI, etc. These tools allow you to securely deploy code from a private repository without exposing it publicly.

## ![](https://cdn.discordapp.com/emojis/1036083490292244493.png)》Support Server

[![DiscordBanner](https://invidget.switchblade.xyz/uMgS9evnmv)](https://discord.gg/uMgS9evnmv)

[Support Server](https://discord.gg/uMgS9evnmv) - Mochi's Support Server Invite
