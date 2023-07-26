const { canModerate } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "nick",
  description: "nickname commands",
  category: "MODERATION",
  botPermissions: ["ManageNicknames"],
  userPermissions: ["ManageNicknames"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "set <@member> <name>",
        description: "sets the nickname of the specified member",
      },
      {
        trigger: "reset <@member>",
        description: "reset a members nickname",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "set",
        description: "change a members nickname",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "the member whose nick you want to set",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "name",
            description: "the nickname to set",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "reset",
        description: "reset a members nickname",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "the members whose nick you want to reset",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === "set") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("Could not find matching member");
      const name = args.slice(2).join(" ");
      if (!name) return message.safeReply("Please specify a nickname");

      const response = await nickname(message, target, name);
      return message.safeReply(response);
    }

    //
    else if (sub === "reset") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("Could not find matching member");

      const response = await nickname(message, target);
      return message.safeReply(response);
    }
  },

  async interactionRun(interaction) {
    const name = interaction.options.getString("name");
    const target = await interaction.guild.members.fetch(interaction.options.getUser("user"));

    const response = await nickname(interaction, target, name);
    await interaction.followUp(response);
  },
};

async function nickname({ member, guild }, target, name) {
  if (!canModerate(member, target)) {
    return `Oops! You cannot manage nickname of ${target.user.username}`;
  }
  if (!canModerate(guild.members.me, target)) {
    return `Oops! I cannot manage nickname of ${target.user.username}`;
  }

  try {
    await target.setNickname(name);
    return `Successfully ${name ? "changed" : "reset"} nickname of ${target.user.username}`;
  } catch (ex) {
    return `Failed to ${name ? "change" : "reset"} nickname for ${target.displayName}. Did you provide a valid name?`;
  }
}
