const user = require("../shared/user");
const channelInfo = require("../shared/channel");
const guildInfo = require("../shared/guild");
const avatar = require("../shared/avatar");
const emojiInfo = require("../shared/emoji");
const botInfo = require("../shared/botstats");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "info",
  description: "show various information",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "get user information",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "name of the user",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "channel",
        description: "get channel information",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "name of the channel",
            type: ApplicationCommandOptionType.Channel,
            required: false,
          },
        ],
      },
      {
        name: "guild",
        description: "get guild information",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "bot",
        description: "get bot information",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "avatar",
        description: "displays avatar information",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "name of the user",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "emoji",
        description: "displays emoji information",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "name of the emoji",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

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
  },
};
