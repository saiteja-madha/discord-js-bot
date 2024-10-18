# 📚 Miscellaneous

## Auto-restarting your bot on git pull

* Add your GitHub repository as the remote origin:

```bash
git init
git remote add origin https://github.com/vixshan/amina.git
```

* Create a new file in the hooks directory of your Git repository:

```bash
nano .git/hooks/post-merge
```

* Add the following code to the post-merge file:

```bash
#!/bin/sh
# pull the latest changes from GitHub
git pull origin master
# restart the bot using PM2
pm2 restart amina
```

Save and close the file.

* Make the file executable:

```bash
chmod +x .git/hooks/post-merge
```

Every time you run `git pull`, it will automatically run the post-merge hook and pull the latest changes from your GitHub repository. The bot will also be restarted automatically using PM2.

{% hint style="warning" %}
NOTE:\
If you want to use `git pull` to update your code automatically, you must keep your GitHub repository public. If you're going to keep your code private, consider using a different method, such as deploying from your machine or using a continuous integration/continuous delivery (CI/CD) tool such as Jenkins, TravisCI, CircleCI, etc.&#x20;

These tools allow you to securely deploy code from a private repository without exposing it publicly.
{% endhint %}

***

[![ko-fi](https://ko-fi.com/img/githubbutton\_sm.svg)](https://ko-fi.com/vikshan)