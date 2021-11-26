const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");
const { resolveMember } = require("@utils/guildUtils");
const profile = require("./shared/profile");

module.exports = class Profile extends Command {
  constructor(client) {
    super(client, {
      name: "profile",
      description: "shows members profile",
      cooldown: 5,
      category: "INFORMATION",
      command: {
        enabled: true,
        usage: "[@member|id]",
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "user",
            description: "target user",
            type: "USER",
            required: false,
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const target = (await resolveMember(message, args[0])) || message.member;
    const response = await profile(message, target.user);
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const response = await profile(interaction, user);
    await interaction.followUp(response);
  }
};
