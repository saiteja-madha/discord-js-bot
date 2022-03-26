const { Command } = require("@src/structures");
const { Message } = require("discord.js");
const { getMatchingChannels } = require("@utils/guildUtils");
const channelInfo = require("../shared/channel");

module.exports = class ChannelInfo extends Command {
  constructor(client) {
    super(client, {
      name: "channelinfo",
      description: "shows information about a channel",
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        usage: "[#channel|id]",
        aliases: ["chinfo"],
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
    let targetChannel;

    if (message.mentions.channels.size > 0) {
      targetChannel = message.mentions.channels.first();
    }

    // find channel by name/ID
    else if (args.length > 0) {
      const search = args.join(" ");
      const tcByName = getMatchingChannels(message.guild, search);
      if (tcByName.length === 0) return message.safeReply(`No channels found matching \`${search}\`!`);
      if (tcByName.length > 1) return message.safeReply(`Multiple channels found matching \`${search}\`!`);
      [targetChannel] = tcByName;
    } else {
      targetChannel = message.channel;
    }

    const response = channelInfo(targetChannel);
    await message.safeReply(response);
  }
};
