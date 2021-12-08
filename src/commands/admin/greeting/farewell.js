const { Command } = require("@src/structures");
const { isHex } = require("@utils/miscUtils");
const { buildGreeting } = require("@src/handlers/greeting");
const { Message, CommandInteraction } = require("discord.js");
const { canSendEmbeds } = require("@utils/guildUtils");
const { getSettings } = require("@schemas/Guild");
const { sendMessage } = require("@utils/botUtils");

module.exports = class Farewell extends Command {
  constructor(client) {
    super(client, {
      name: "farewell",
      description: "setup farewell message",
      category: "ADMIN",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        minArgsCount: 1,
        subcommands: [
          {
            trigger: "status <on|off>",
            description: "enable or disable farewell message",
          },
          {
            trigger: "channel <#channel>",
            description: "configure farewell message",
          },
          {
            trigger: "preview",
            description: "preview the configured farewell message",
          },
          {
            trigger: "desc <text>",
            description: "set embed description",
          },
          {
            trigger: "thumbnail <ON|OFF>",
            description: "enable/disable embed thumbnail",
          },
          {
            trigger: "color <hexcolor>",
            description: "set embed color",
          },
          {
            trigger: "footer <text>",
            description: "set embed footer content",
          },
        ],
      },
      slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
          {
            name: "status",
            description: "enable or disable farewell message",
            type: "SUB_COMMAND",
            options: [
              {
                name: "status",
                description: "enabled or disabled",
                required: true,
                type: "STRING",
                choices: [
                  {
                    name: "ON",
                    value: "ON",
                  },
                  {
                    name: "OFF",
                    value: "OFF",
                  },
                ],
              },
            ],
          },
          {
            name: "preview",
            description: "preview the configured farewell message",
            type: "SUB_COMMAND",
          },
          {
            name: "channel",
            description: "set farewell channel",
            type: "SUB_COMMAND",
            options: [
              {
                name: "channel",
                description: "channel name",
                type: "CHANNEL",
                channelTypes: ["GUILD_TEXT"],
                required: true,
              },
            ],
          },
          {
            name: "desc",
            description: "set embed description",
            type: "SUB_COMMAND",
            options: [
              {
                name: "content",
                description: "description content",
                type: "STRING",
                required: true,
              },
            ],
          },
          {
            name: "thumbnail",
            description: "configure embed thumbnail",
            type: "SUB_COMMAND",
            options: [
              {
                name: "status",
                description: "thumbnail status",
                type: "STRING",
                required: true,
                choices: [
                  {
                    name: "ON",
                    value: "ON",
                  },
                  {
                    name: "OFF",
                    value: "OFF",
                  },
                ],
              },
            ],
          },
          {
            name: "color",
            description: "set embed color",
            type: "SUB_COMMAND",
            options: [
              {
                name: "hex-code",
                description: "hex color code",
                type: "STRING",
                required: true,
              },
            ],
          },
          {
            name: "footer",
            description: "set embed footer",
            type: "SUB_COMMAND",
            options: [
              {
                name: "content",
                description: "footer content",
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
    const type = args[0].toLowerCase();
    const settings = await getSettings(message.guild);
    let response;

    // preview
    if (type === "preview") {
      response = await sendPreview(settings, message.member);
    }

    // status
    if (type === "status") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status)) return message.reply("Invalid status. Value must be `on/off`");
      response = await setStatus(settings, status);
    }

    // channel
    else if (type === "channel") {
      const channel = message.mentions.channels.first();
      response = await setChannel(settings, channel);
    }

    // desc
    if (type === "desc") {
      if (args.length < 2) return message.reply("Insufficient arguments! Please provide valid content");
      const desc = args.slice(1).join(" ");
      response = await setDescription(settings, desc);
    }

    // thumbnail
    if (type === "thumbnail") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status)) return message.reply("Invalid status. Value must be `on/off`");
      response = await setThumbnail(settings, status);
    }

    // color
    if (type === "color") {
      const color = args[1];
      if (!color || !isHex(color)) return message.reply("Invalid color. Value must be a valid hex color");
      response = await setColor(settings, color);
    }

    // footer
    if (type === "footer") {
      if (args.length < 2) return message.reply("Insufficient arguments! Please provide valid content");
      const content = args.slice(1).join(" ");
      response = await setFooter(settings, content);
    }

    return message.reply(response);
  }

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    const settings = await getSettings(interaction.guild);

    let response;
    switch (sub) {
      case "preview":
        response = await sendPreview(settings, interaction.member);
        break;

      case "status":
        response = await setStatus(settings, interaction.options.getString("status"));
        break;

      case "channel":
        response = await setChannel(settings, interaction.options.getChannel("channel"));
        break;

      case "desc":
        response = await setDescription(settings, interaction.options.getString("content"));
        break;

      case "thumbnail":
        response = await setThumbnail(settings, interaction.options.getString("status"));
        break;

      case "color":
        response = await setColor(settings, interaction.options.getString("color"));
        break;

      case "footer":
        response = await setFooter(settings, interaction.options.getString("content"));
        break;

      default:
        response = "Invalid subcommand";
    }

    return interaction.followUp(response);
  }
};

async function sendPreview(settings, member) {
  if (!settings.farewell?.enabled) return "Farewell message not enabled in this server";

  const targetChannel = member.guild.channels.cache.get(settings.farewell.channel);
  if (!targetChannel) return "No channel is configured to send farewell message";

  const response = await buildGreeting(member, "FAREWELL", settings.farewell);
  await sendMessage(targetChannel, response);

  return `Sent farewell preview to ${targetChannel.toString()}`;
}

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "ON" ? true : false;
  settings.farewell.enabled = enabled;
  await settings.save();
  return `Configuration saved! Farewell message ${status ? "enabled" : "disabled"}`;
}

async function setChannel(settings, channel) {
  if (!canSendEmbeds(channel)) {
    return (
      "Ugh! I cannot send greeting to that channel? I need the `Write Messages` and `Embed Links` permissions in " +
      channel.toString()
    );
  }
  settings.farewell.channel = channel.id;
  await settings.save();
  return `Configuration saved! Farewell message will be sent to ${channel ? channel.toString() : "Not found"}`;
}

async function setDescription(settings, desc) {
  settings.farewell.embed.description = desc;
  await settings.save();
  return "Configuration saved! Farewell message updated";
}

async function setThumbnail(settings, status) {
  settings.farewell.embed.thumbnail = status.toUpperCase() === "ON" ? true : false;
  await settings.save();
  return "Configuration saved! Farewell message updated";
}

async function setColor(settings, color) {
  settings.farewell.embed.color = color;
  await settings.save();
  return "Configuration saved! Farewell message updated";
}

async function setFooter(settings, content) {
  settings.farewell.embed.footer = content;
  await settings.save();
  return "Configuration saved! Farewell message updated";
}
