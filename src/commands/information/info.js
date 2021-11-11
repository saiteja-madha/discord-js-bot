const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");
const { resolveMember, getMatchingChannel } = require("@utils/guildUtils");
const user = require("./sub/user");
const channelInfo = require("./sub/channel");
const guildInfo = require("./sub/guild");
const avatar = require("./sub/avatar");
const emojiInfo = require("./sub/emoji");
const botInfo = require("./sub/botstats");

module.exports = class InfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: "info",
      description: "show various information",
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        subcommands: [
          {
            trigger: "user [@user]",
            description: "get user information",
          },
          {
            trigger: "channel [#channel]",
            description: "get channel information",
          },
          {
            trigger: "guild",
            description: "get guild information",
          },
          {
            trigger: "bot",
            description: "get bot information",
          },
          {
            trigger: "avatar [@user]",
            description: "get avatar information",
          },
          {
            trigger: "emoji <emoji>",
            description: "get emoji information",
          },
        ],
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "user",
            description: "get user information",
            type: "SUB_COMMAND",
            options: [
              {
                name: "name",
                description: "name of the user",
                type: "USER",
                required: false,
              },
            ],
          },
          {
            name: "channel",
            description: "get channel information",
            type: "SUB_COMMAND",
            options: [
              {
                name: "name",
                description: "name of the channel",
                type: "CHANNEL",
                required: false,
              },
            ],
          },
          {
            name: "guild",
            description: "get guild information",
            type: "SUB_COMMAND",
          },
          {
            name: "bot",
            description: "get bot information",
            type: "SUB_COMMAND",
          },
          {
            name: "avatar",
            description: "displays avatar information",
            type: "SUB_COMMAND",
            options: [
              {
                name: "name",
                description: "name of the user",
                type: "USER",
                required: false,
              },
            ],
          },
          {
            name: "emoji",
            description: "displays emoji information",
            type: "SUB_COMMAND",
            options: [
              {
                name: "name",
                description: "name of the emoji",
                type: "STRING",
                required: true,
              },
            ],
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const sub = args[0].toLowerCase();
    let response;

    // user
    if (sub === "user") {
      let target = message.member;
      if (args.length > 1) target = (await resolveMember(message, args[1])) || message.member;
      response = user(target);
    }

    // channel
    else if (sub === "channel") {
      let targetChannel;

      if (message.mentions.channels.size > 0) {
        targetChannel = message.mentions.channels.first();
      } else if (args.length > 0) {
        const search = args.join(" ");
        const tcByName = getMatchingChannel(message.guild, search);
        if (tcByName.length === 0) return message.reply(`No channels found matching \`${search}\`!`);
        if (tcByName.length > 1) return message.reply(`Multiple channels found matching \`${search}\`!`);
        [targetChannel] = tcByName;
      } else {
        targetChannel = message.channel;
      }

      response = channelInfo(targetChannel);
    }

    // guild
    else if (sub === "guild") {
      response = await guildInfo(message.guild);
    }

    // bot
    else if (sub === "bot") {
      response = botInfo(message.client);
    }

    // avatar
    else if (sub === "avatar") {
      const target = (await resolveMember(message, args[0])) || message.member;
      response = avatar(target.user);
    }

    // emoji
    else if (sub === "emoji") {
      const emoji = args[0];
      response = emojiInfo(emoji, message.guild);
    }

    // Do nothing
    else {
      return;
    }

    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp("Not a valid subcommand");
    let response;

    // user
    if (sub === "user") {
      let targetUser = interaction.options.getUser("name") || interaction.user;
      let target = await interaction.guild.members.fetch(targetUser);
      response = user(target);
    }

    // channel
    else if (sub === "channel") {
      let targetChannel = interaction.options.getChannel("name") || interaction.channel;
      response = channelInfo(targetChannel);
    }

    // guild
    else if (sub === "guild") {
      response = await guildInfo(interaction.guild);
    }

    // bot
    else if (sub === "bot") {
      response = botInfo(interaction.client);
    }

    // avatar
    else if (sub === "avatar") {
      let target = interaction.options.getUser("name") || interaction.user;
      response = avatar(target);
    }

    // emoji
    else if (sub === "emoji") {
      let emoji = interaction.options.getString("name");
      response = emojiInfo(emoji);
    }

    // return
    else {
      response = "Incorrect subcommand";
    }

    await interaction.followUp(response);
  }
};
