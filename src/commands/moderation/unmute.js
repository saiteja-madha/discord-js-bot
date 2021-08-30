const { Command } = require("@src/structures");
const { unmute } = require("@schemas/mute-schema");
const { canInteract } = require("@utils/modUtils");
const { getRoleByName } = require("@utils/guildUtils");
const { Message } = require("discord.js");

module.exports = class UnmuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "unmute",
      description: "umutes the specified member(s)",
      command: {
        enabled: true,
        usage: "<@member(s)> [reason]",
        minArgsCount: 1,
        category: "MODERATION",
        botPermissions: ["MANAGE_ROLES"],
        userPermissions: ["KICK_MEMBERS"],
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
    const { guild, channel } = message;
    const { member } = message;
    const mentions = message.mentions.members;

    if (mentions.size == 0) return message.reply("No members mentioned");

    const mutedRole = getRoleByName(guild, "muted");
    if (!mutedRole.editable) {
      return message.reply(
        "I do not have permission to move members to `Muted` role. Is that role below my highest role?"
      );
    }

    mentions
      .filter((target) => canInteract(member, target, "unmute", channel))
      .forEach(async (target) => {
        const result = await unmute(guild.id, target.id);

        if (result.nModified === 1) {
          await target.roles.remove(mutedRole);
          channel.send(`${target.user.tag} is unmuted`);
        } else {
          channel.send(`${target.user.tag} is not muted`);
        }
      });
  }
};
