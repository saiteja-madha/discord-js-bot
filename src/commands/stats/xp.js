const { getMatchingChannels } = require("@utils/guildUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "xp",
  description: "configure the levelling system",
  category: "STATS",
  userPermissions: ["MANAGE_GUILD"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "message <new-message>",
        description: "set custom level up message",
      },
      {
        trigger: "channel <#channel|off>",
        description: "set the channel to send level up messages to",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "message",
        description: "set custom level up message",
        type: "SUB_COMMAND",
        options: [
          {
            name: "message",
            description: "message to display when a user levels up",
            type: "STRING",
            required: true,
          },
        ],
      },
      {
        name: "channel",
        description: "set the channel to send level up messages to",
        type: "SUB_COMMAND",
        options: [
          {
            name: "channel",
            description: "channel to send level up messages to",
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"],
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0];
    const subcommandArgs = args.slice(1);
    let response;

    // message
    if (sub === "message") {
      const message = subcommandArgs.join(" ");
      response = await setMessage(message, data.settings);
    }

    // channel
    else if (sub === "channel") {
      const input = subcommandArgs[0];
      let channel;

      if (input === "off") channel = "off";
      else {
        const match = getMatchingChannels(message.guild, input);
        if (match.length === 0) return message.safeReply("Invalid channel. Please provide a valid channel");
        channel = match[0];
      }
      response = await setChannel(channel, data.settings);
    }

    // invalid
    else response = "Invalid subcommand";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubCommand();
    let response;

    if (sub === "message") response = await setMessage(interaction.options.getString("message"), data.settings);
    else if (sub === "channel") response = await setChannel(interaction.options.getChannel("channel"), data.settings);
    else response = "Invalid subcommand";

    await interaction.followUp(response);
  },
};

async function setMessage(message, settings) {
  if (!message) return "Invalid message. Please provide a message";
  settings.stats.xp.message = message;
  await settings.save();
  return `Configuration saved. Level up message updated!`;
}

async function setChannel(channel, settings) {
  if (!channel) return "Invalid channel. Please provide a channel";

  if (channel === "off") settings.stats.xp.channel = null;
  else settings.stats.xp.channel = channel.id;

  await settings.save();
  return `Configuration saved. Level up channel updated!`;
}
