const { Command } = require("@src/structures");
const { isHex } = require("@utils/miscUtils");
const db = require("@schemas/greeting-schema");
const { getConfig } = require("@schemas/greeting-schema");
const { buildEmbed } = require("@src/handlers/greeting-handler");
const { Message } = require("discord.js");

module.exports = class Farewell extends Command {
  constructor(client) {
    super(client, {
      name: "farewell",
      description: "setup farewell message",
      command: {
        enabled: true,
        minArgsCount: 1,
        subcommands: [
          {
            trigger: "<#channel|OFF>",
            description: "enable or disable farewell message",
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
        category: "ADMIN",
        userPermissions: ["ADMINISTRATOR"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const type = args[0].toLowerCase();

    switch (type) {
      case "off":
        await db.setChannel(message.guildId, null, "farewell");
        return message.reply("Configuration saved! Farewell message disabled");

      case "preview":
        return sendPreview(message);

      case "desc":
        return setDescription(message, args);

      case "thumbnail":
        return setThumbnail(message, args);

      case "color":
        return setColor(message, args);

      case "footer":
        return setFooter(message, args);

      default:
        if (message.mentions.channels.size > 0) {
          const target = message.mentions.channels.first();
          await db.setChannel(message.guildId, target.id, "farewell");
          message.reply(`Configuration saved! Farewell messages will be sent to ${target.toString()}`);
        } else {
          message.reply("Incorrect command usage");
        }
    }
  }
};

async function sendPreview(message) {
  const config = (await getConfig(message.guild.id))?.farewell;
  if (!config || !config.enabled) return message.reply("Farewell message not enabled in this server");

  const targetChannel = message.guild.channels.cache.get(config.channel_id);
  if (!config.embed.description) {
    config.embed.description = "Goodbye {member:tag}!";
  }

  const embed = await buildEmbed(message.member, config?.embed);
  message.channel.send({
    content: `Target Channel: ${targetChannel ? targetChannel.toString() : "Not found"}`,
    embeds: [embed],
  });
}

async function setDescription(message, args) {
  if (args.length < 2) return message.reply("Insufficient arguments! Please provide valid content");
  const content = args.slice(1).join(" ");

  await db.setDescription(message.guild.id, content, "farewell");
  message.reply("Configuration saved! Farewell message updated");
}

async function setThumbnail(message, args) {
  if (args.length < 2) return message.reply("Insufficient arguments! Please provide a valid argument (`on/off`)");

  let thumbnail;
  if (args[1].toLowerCase() === "on") thumbnail = true;
  else if (args[1].toLowerCase() === "off") thumbnail = false;
  else return message.reply("Invalid input. Value must be `on/off`");

  await db.setThumbnail(message.guild.id, thumbnail, "farewell");
  message.reply("Configuration saved! Farewell message updated");
}

async function setColor(message, args) {
  if (args.length < 2) return message.reply("Insufficient arguments! Please provide a valid Hex color");
  const color = args[1];

  if (!isHex(color)) return message.reply("Oops! That doesn't look like a valid HEX Color code");

  await db.setColor(message.guild.id, color, "farewell");
  message.reply("Configuration saved! Farewell message updated");
}

async function setFooter(message, args) {
  if (args.length < 2) return message.reply("Insufficient arguments! Please provide valid content");
  const content = args.slice(1).join(" ");

  await db.setFooter(message.guild.id, content, "farewell");
  message.reply("Configuration saved! Farewell message updated");
}
