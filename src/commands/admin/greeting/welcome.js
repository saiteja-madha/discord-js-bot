const { Command, CommandContext } = require("@src/structures");
const { isHex } = require("@utils/miscUtils");
const db = require("@schemas/greeting-schema");
const { buildEmbed } = require("@root/src/features/greeting-handler");
const { getConfig } = require("@schemas/greeting-schema");

module.exports = class Welcome extends Command {
  constructor(client) {
    super(client, {
      name: "welcome",
      description: "setup welcome message",
      minArgsCount: 1,
      subcommands: [
        {
          trigger: "<#channel|OFF>",
          description: "enable or disable welcome message",
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
      category: "ADMIN",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args, guild } = ctx;
    const type = args[0].toLowerCase();

    switch (type) {
      case "off":
        db.setChannel(guild.id, null, "welcome")
          .then(ctx.reply("Configuration saved! Welcome message disabled"))
          .catch((_) => ctx.reply("Failed to save configuration"));
        break;

      case "preview":
        return await sendPreview(ctx);

      case "desc":
        return await setDescription(ctx);

      case "thumbnail":
        return await setThumbnail(ctx);

      case "color":
        return await setColor(ctx);

      case "footer":
        return await setFooter(ctx);

      default:
        if (message.mentions.channels.size > 0) {
          const target = message.mentions.channels.first();
          db.setChannel(guild.id, target.id, "welcome")
            .then(ctx.reply("Configuration saved! Welcome messages will be sent to " + target.toString()))
            .catch((_) => ctx.reply("Failed to save configuration"));
        } else {
          message.reply("Incorrect command usage");
        }
    }
  }
};

/**
 * @param {CommandContext} ctx
 */
async function sendPreview(ctx) {
  const config = (await getConfig(ctx.guild.id))?.welcome;
  let embed = await buildEmbed(ctx.message.member, config?.embed);
  if (embed) {
    ctx.reply({ embeds: [embed] });
  }
}

async function setDescription(ctx) {
  const { message, args } = ctx;
  if (args.length < 2) return message.reply("Insufficient arguments! Please provide valid content");
  const content = args.slice(1).join(" ");

  db.setDescription(message.guild.id, content, "welcome")
    .then(ctx.reply("Configuration saved! Welcome message updated"))
    .catch((_) => ctx.reply("Failed to save configuration"));
}

async function setThumbnail(ctx) {
  const { message, args } = ctx;
  if (args.length < 2) return message.reply("Insufficient arguments! Please provide a valid argument (`on/off`)");

  let thumbnail;
  if (args[1].toLowerCase() === "on") thumbnail = true;
  else if (args[1].toLowerCase() === "off") thumbnail = false;
  else return message.reply("Invalid input. Value must be `on/off`");

  db.setThumbnail(message.guild.id, thumbnail, "welcome")
    .then(ctx.reply("Configuration saved! Welcome message updated"))
    .catch((_) => ctx.reply("Failed to save configuration"));
}

async function setColor(ctx) {
  const { message, args } = ctx;
  if (args.length < 2) return message.reply("Insufficient arguments! Please provide a valid Hex color");
  const color = args[1];

  if (!isHex(color)) return message.reply("Oops! That doesn't look like a valid HEX Color code");

  db.setColor(message.guild.id, color, "welcome")
    .then(ctx.reply("Configuration saved! Welcome message updated"))
    .catch((_) => ctx.reply("Failed to save configuration"));
}

async function setFooter(ctx) {
  const { message, args } = ctx;
  if (args.length < 2) return message.reply("Insufficient arguments! Please provide valid content");
  const content = args.slice(1).join(" ");

  db.setFooter(message.guild.id, content, "welcome")
    .then(ctx.reply("Configuration saved! Welcome message updated"))
    .catch((_) => ctx.reply("Failed to save configuration"));
}
