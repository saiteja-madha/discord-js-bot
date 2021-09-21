const { Command } = require("@src/structures");
const { setupMutedRole, canInteract, addModAction } = require("@utils/modUtils");
const { getRoleByName, resolveMember } = require("@utils/guildUtils");
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
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args, invoke, prefix) {
    if (args[0].toLowerCase() === "setup") return muteSetup(message);

    const { content } = message;
    const mentions = message.mentions.members;

    let mutedRole = getRoleByName(message.guild, "muted");

    if (!mutedRole) {
      return message.reply(`Muted role doesn't exist! Use \`${prefix}mute setup\` to create one`);
    }

    if (!mutedRole.editable) {
      return message.reply(
        "I do not have permission to move members to `Muted` role. Is that role below my highest role?"
      );
    }

    // !mute ID <reason>
    if (mentions.size === 0) {
      const target = await resolveMember(message, args[0], true);
      if (!target) return message.reply(`No user found matching ${args[0]}`);
      const reason = content.split(args[0])[1].trim();
      return mute(message, target, reason);
    }

    // !mute @m1 @m2 ... <reason>
    const regex = /<@!?(\d+)>/g;
    const matches = content.match(regex);
    const lastMatch = matches[matches.length - 1];
    const reason = content.split(lastMatch)[1].trim();

    mentions.forEach(async (target) => await mute(message, target, reason));
  }
};

async function muteSetup(message) {
  let mutedRole = getRoleByName(message.guild, "muted");
  if (mutedRole) return message.reply("Muted role already exists");

  if (!message.guild.me.permissions.has("MANAGE_GUILD")) {
    return message.reply("I need `Manage Guild` permission to create a new `Muted` role!");
  }

  mutedRole = await setupMutedRole(message.guild);

  if (!mutedRole) {
    return message.reply(
      `Something went wrong while setting up. Please make sure I have permission to edit/create roles, and modify every channel.
          Alternatively, give me the \`Administrator\` permission for setting up`
    );
  }

  await message.reply("Muted role is successfully setup");
}

async function mute(message, target, reason) {
  if (!canInteract(message.member, target, "mute", message.channel)) return;
  const status = await addModAction(message.member, target, reason, "MUTE");
  if (status === "ALREADY_MUTED") return message.channel.send(`${target.user.tag} is already muted`);
  if (status) message.channel.send(`${target.user.tag} is now muted on this server`);
  else message.channel.send(`Failed to add muted role to ${target.user.tag}`);
}
