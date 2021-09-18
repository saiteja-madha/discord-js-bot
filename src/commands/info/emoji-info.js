const { Command } = require("@src/structures");
const Discord = require('discord.js')
const { Message } = require("discord.js");

module.exports = class EmojiInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: "emojiinfo",
      aliases: ["emoji"],
      description: "shows info about an emoji",
      command: {
        enabled: true,
        category: "INFORMATION",
      },
      slashCommand: {
        enabled: false,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const emoji = args[0];
    if (!emoji) return message.channel.send("No emoji provided!");
    let custom = Discord.Util.parseEmoji(emoji);
    let url = `https://cdn.discordapp.com/emojis/${custom.id}`
    let link = ""
    if (custom.animated === true) {
        link = `${url}.gif?v=1`
    }
    else {
        link = `${url}.png`
    }
    
  return message.channel.send(`**Id:** ${custom.id}\n**Name:** ${custom.name}\n**Animated:** ${custom.animated ? "Yes" : "No"}\n**Url:** ${link}`);
  }}