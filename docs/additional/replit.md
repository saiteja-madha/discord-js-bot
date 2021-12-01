 ✍ Guides | Setting up Strangebot for Replit!

### Intro

Replit does not automatically update node to the latest version. **This is a problem as Strangebot runs on Discord.js V13

{% hint style="warning" %}
Migration to V13 will take a while, But once it is done, it is done forever!
{% endhint %}

### Guide

* 1. Create a new repl. **Set the language as "Nix (Beta)" ** [Language Setup](https://i.imgur.com/4cxgFKg.png)

* 2. Go to the file "replit.nix" and copy the code below (You can get rid of cowsay if you want, but who doesnt love cowsay?) **Save this file, Replit does this automatically... Sometimes**
```
{ pkgs }: {
    deps = [
        pkgs.cowsay
        pkgs.nodejs-16_x
    ];
}
```
* 3. Go to the file ".replit" and change its contents to the code below. (We will change this later, this is just for our testing purposes)

```run = "node test.js"```

* 4. Create a new file named "test.js", its contents should look like this.

```console.log(process.version)```
* 5. Run the replit. The console should output the correct Node version. (Anything around V16) [Something like this](https://imgur.com/dLq6N3e)

### Main part of Guide
* 6. Clone the git repository. 

```git clone https://github.com/saiteja-madha/discord-js-bot.git```

* 7. Move the contents of the cloned folder into the main directory. **Do this for all files** [Like this](https://imgur.com/ki5ugSk)

 (I do this by hand, There is probably a linux command I dont know that could do this for us.) 

* 8. Go to the **Shell** and type 

```npm i```

* 9. Go to the ".replit" file and make sure it looks like this 

```run = "node ."```

* 10. **Your Done!** Now all you have to do is edit the config.js file and add your env secrets. [Should look like this](https://imgur.com/AEhiHLk)

### Closing Remarks
Good job, Your bot is done. 
Replit is a really good host for discord bots as it allows for powerful machinery with low costs and 24/7 uptime. IMO, The hacker plan is the best plan for hosting a discord bot for beginners or even serious developers. 

This guide was created by mid (mid#0002). My bot is available at https://www.beemo.best.

Join the Strangebot support server for any further help.
