const { Command, CommandContext } = require("@root/command");

module.exports = class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "shows the current ping from the bot to the discord servers",
      category: "INFORMATION",
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;
    ctx.reply("🏓 Pong : `" + Math.floor(message.client.ws.ping) + "ms`");
  }
};
