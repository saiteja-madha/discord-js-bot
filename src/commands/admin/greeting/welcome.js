const { Command } = require("@src/structures");
const { isHex } = require("@utils/miscUtils");
const { buildGreeting } = require("@src/handlers/greeting");
const { Message, CommandInteraction } = require("discord.js");
const { canSendEmbeds } = require("@utils/guildUtils");
const { sendMessage } = require("@utils/botUtils");

module.exports = class Welcome extends Command {
  constructor(client) {
    super(client, {
      name: "welcome",
      description: "setup welcome message",
      category: "ADMIN",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        minArgsCount: 1,
        subcommands: [
          {
            trigger: "status <on|off>",
            description: "enable or disable welcome message",
          },
          {
            trigger: "channel <#channel>",
            description: "configure welcome message",
          },
          {
            trigger: "preview",
            description: "preview the configured welcome message",
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
            description: "enable or disable welcome message",
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
            description: "preview the configured welcome message",
            type: "SUB_COMMAND",
          },
          {
            name: "channel",
            description: "set welcome channel",
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
   * @param {object} data
   */
  async messageRun(message, args, data) {
    const type = args[0].toLowerCase();
    const settings = data.settings;
    let response;

    // preview
    if (type === "preview") {
      response = await sendPreview(settings, message.member);
    }

    // status
    else if (type === "status") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Invalid status. Value must be `on/off`");
      response = await setStatus(settings, status);
    }

    // channel
    else if (type === "channel") {
      const channel = message.mentions.channels.first();
      response = await setChannel(settings, channel);
    }

    // desc
    else if (type === "desc") {
      if (args.length < 2) return message.safeReply("Insufficient arguments! Please provide valid content");
      const desc = args.slice(1).join(" ");
      response = await setDescription(settings, desc);
    }

    // thumbnail
    else if (type === "thumbnail") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Invalid status. Value must be `on/off`");
      response = await setThumbnail(settings, status);
    }

    // color
    else if (type === "color") {
      const color = args[1];
      if (!color || !isHex(color)) return message.safeReply("Invalid color. Value must be a valid hex color");
      response = await setColor(settings, color);
    }

    // footer
    else if (type === "footer") {
      if (args.length < 2) return message.safeReply("Insufficient arguments! Please provide valid content");
      const content = args.slice(1).join(" ");
      response = await setFooter(settings, content);
    }

    //
    else response = "Invalid command usage!";
    return message.safeReply(response);
  }

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {object} data
   */
  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

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
  if (!settings.welcome?.enabled) return "Welcome message not enabled in this server";

  const targetChannel = member.guild.channels.cache.get(settings.welcome.channel);
  if (!targetChannel) return "No channel is configured to send welcome message";

  const response = await buildGreeting(member, "WELCOME", settings.welcome);
  await sendMessage(targetChannel, response);

  return `Sent welcome preview to ${targetChannel.toString()}`;
}

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "ON" ? true : false;
  settings.welcome.enabled = enabled;
  await settings.save();
  return `Configuration saved! Welcome message ${enabled ? "enabled" : "disabled"}`;
}

async function setChannel(settings, channel) {
  if (!canSendEmbeds(channel)) {
    return (
      "Ugh! I cannot send greeting to that channel? I need the `Write Messages` and `Embed Links` permissions in " +
      channel.toString()
    );
  }
  settings.welcome.channel = channel.id;
  await settings.save();
  return `Configuration saved! Welcome message will be sent to ${channel ? channel.toString() : "Not found"}`;
}

async function setDescription(settings, desc) {
  settings.welcome.embed.description = desc;
  await settings.save();
  return "Configuration saved! Welcome message updated";
}

async function setThumbnail(settings, status) {
  settings.welcome.embed.thumbnail = status.toUpperCase() === "ON" ? true : false;
  await settings.save();
  return "Configuration saved! Welcome message updated";
}

async function setColor(settings, color) {
  settings.welcome.embed.color = color;
  await settings.save();
  return "Configuration saved! Welcome message updated";
}

async function setFooter(settings, content) {
  settings.welcome.embed.footer = content;
  await settings.save();
  return "Configuration saved! Welcome message updated";
}
