const { musicValidations } = require("@helpers/BotUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "24-7",
  description: "enable or disable 24/7 mode",
  category: "MUSIC",
  userPermissions: ["ManageGuild"],
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    usage: "<on|off>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "status",
        type: ApplicationCommandOptionType.String,
        description: "enable or disable 24/7 mode",
        required: true,
        choices: [
          {
            name: "on",
            value: "on",
          },
          {
            name: "off",
            value: "off",
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    const response = await toggleTwentyFourSevenMode(message, input, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const input = interaction.options.getString("status").toLowerCase();
    const response = await toggleTwentyFourSevenMode(interaction, input, data.settings);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {"on"|"off"} input
 */
async function toggleTwentyFourSevenMode({ client, guild }, input, settings) {
  if (input !== "on" && input !== "off") return { content: "Invalid option. Please use `on` or `off`." };

  const currentStatus = settings.music.twenty_four_seven.enabled;
  const newStatus = input === "on";

  if (currentStatus !== newStatus) {
    settings.music.twenty_four_seven.enabled = newStatus;
    await settings.save();

    return { content: `24/7 mode is now ${newStatus ? "enabled" : "disabled"}` };
  } else {
    return { content: `24/7 mode is already ${newStatus ? "enabled" : "disabled"}` };
  }
}
