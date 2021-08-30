const { Command } = require("@src/structures");
const { addMuteToDb, getMuteInfo } = require("@schemas/mute-schema");
const { setupMutedRole, canInteract } = require("@utils/modUtils");
const { getRoleByName } = require("@utils/guildUtils");
const { Message } = require("discord.js");

module.exports = class MuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "mute",
      description: "mutes the specified member(s)",
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
    const { author, member, content } = message;
    const mentions = message.mentions.members;

    if (mentions.size == 0) return message.reply("No members mentioned");

    let mutedRole = getRoleByName(guild, "muted");

    if (!mutedRole) {
      if (!guild.me.permissions.has("MANAGE_GUILD")) {
        return message.reply("No `Muted` role exists! Please create a muted role before using this command");
      }

      message.reply("No `Muted` role exists! Attempting to create a muted role...");
      mutedRole = await setupMutedRole(guild);

      if (!mutedRole) {
        return message.reply(
          `Something went wrong while setting up. Please make sure I have permission to edit/create roles, and modify every channel.
          Alternatively, give me the \`Administrator\` permission for setting up`
        );
      }
    }

    if (!mutedRole.editable) {
      return message.reply(
        "I do not have permission to move members to `Muted` role. Is that role below my highest role?"
      );
    }

    const regex = /<@!?(\d+)>/g;
    let match = regex.exec(content);
    let lastMatch;
    while (match != null) {
      lastMatch = match[0];
      match = regex.exec(content);
    }
    const reason = content.split(lastMatch)[1].trim() || "No reason provided";

    mentions
      .filter((target) => canInteract(member, target, "mute", channel))
      .forEach(async (target) => {
        const previousMute = await getMuteInfo(guild, target.id);

        if (previousMute) {
          if (previousMute.isPermanent && previousMute.current) {
            return channel.send(`${target.user.tag} is already muted`);
          }
        }

        try {
          await target.roles.add(mutedRole);
        } catch (ex) {
          console.log(ex);
          return channel.send(`Failed to add muted role to ${target.user.tag}`);
        }

        await addMuteToDb(guild, author, target, reason);
        channel.send(`${target.user.tag} is now muted on this server`);
      });
  }
};
