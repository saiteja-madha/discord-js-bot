const { Command, CommandContext } = require("@src/structures");
const { clearInvites } = require("@schemas/invite-schema");
const { resolveMember } = require("@utils/guildUtils");
const { Message } = require("discord.js");

module.exports = class ClearInvites extends Command {
  constructor(client) {
    super(client, {
      name: "clearinvites",
      description: "clear a users added invites",
      command: {
        enabled: true,
        usage: "<@member>",
        minArgsCount: 1,
        category: "INVITE",
        botPermissions: ["EMBED_LINKS"],
        userPermissions: ["ADMINISTRATOR"],
      },
      slashCommand: {
        enabled: false,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const target = await resolveMember(message, args[0], true);
    if (!target) return message.reply("Incorrect syntax. You must mention a target");

    await clearInvites(message.guild.id, target.id);
    message.reply(`Done! Invites cleared for \`${target.user.tag}\``);
  }
};
