const { Command, CommandContext } = require("@src/structures");
const { automodLogChannel } = require("@schemas/guild-schema");
const { canSendEmbeds } = require("@utils/guildUtils");

module.exports = class AutoModLog extends Command {
  constructor(client) {
    super(client, {
      name: "automodlog",
      description: "enable/disable logging of automod events",
      usage: "<#channel|OFF>",
      minArgsCount: 1,
      category: "AUTOMOD",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args, guild } = ctx;
    const input = args[0].toLowerCase();
    let targetChannel;

    if (input === "none" || input === "off" || input === "disable") targetChannel = null;
    else {
      if (message.mentions.channels.size == 0) return ctx.reply("Incorrect command usage");
      targetChannel = message.mentions.channels.first();

      if (!canSendEmbeds(targetChannel))
        return ctx.reply(
          "Ugh! I cannot send logs to that channel? I need the `Write Messages` and `Embed Links` permissions in that channel"
        );
    }

    await automodLogChannel(guild.id, targetChannel?.id)
      .then(() => {
        ctx.reply(`Configuration saved! AutomodLog channel ${targetChannel ? "updated" : "removed"}`);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Unexpected backend error");
      });
  }
};
