const { Command, CommandContext } = require("@src/structures");
const db = require("@schemas/guild-schema");

module.exports = class FlagTranslation extends Command {
  constructor(client) {
    super(client, {
      name: "flagtr",
      description: "setup flag translation",
      minArgsCount: 1,
      subcommands: [
        {
          trigger: "<ON|OFF>",
          description: "enable or disable translation by flags",
        },
        {
          trigger: "status",
          description: "flag translation status",
        },
        {
          trigger: "add <#channel(s)>",
          description: "add channels where flag translation must occur",
        },
        {
          trigger: "remove <#channel(s)>",
          description: "remove channels with flag translations enabled",
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
    const { args, message } = ctx;
    const input = args[0].toLowerCase();
    const mentions = message.mentions.channels.map((ch) => ch.id);
    const settings = await db.getSettings(message.guild);

    switch (input) {
      case "add":
        if (mentions.size === 0) return message.reply("Incorrect usage! You need to mentions channels");
        let toAdd = [...new Set([...mentions, ...settings.flag_translation.channels])];
        await db.setFlagTrChannels(message.guildId, toAdd);
        ctx.reply("Success! Configuration saved");
        break;

      case "remove":
        if (mentions.size === 0) return message.reply("Incorrect usage! You need to mentions channels");
        let newIds = settings.flag_translation.channels.filter((item) => !mentions.includes(item));
        await db.setFlagTrChannels(message.guildId, newIds);
        ctx.reply("Success! Configuration saved");
        break;

      case "status":
        if (!settings.flag_translation.enabled) return await ctx.reply("Flag translation is disabled in this server");
        let channels = settings.flag_translation.channels
          .filter((id) => message.guild.channels.cache.has(id))
          .map((id) => message.guild.channels.cache.get(id).toString())
          .join(", ");

        if (!channels) return ctx.reply("Flag translation is enabled in all channels");
        ctx.reply("Flag translation is enabled in following channels: \n" + channels);
        break;

      default:
        let status;
        if (input === "none" || input === "off" || input === "disable") status = false;
        else if (input === "on" || input === "enable") status = true;
        else return message.reply("Incorrect Command Usage");

        await db.flagTranslation(message.guildId, status);
        ctx.reply(`Configuration saved! Flag translation is now ${status ? "enabled" : "disabled"}`);
    }
  }
};
