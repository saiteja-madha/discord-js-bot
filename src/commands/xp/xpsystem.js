/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "xpsystem",
  description: "enable or disable XP ranking system in the server",
  category: "XP_SYSTEM",
  userPermissions: ["MANAGE_GUILD"],
  command: {
    enabled: true,
    aliases: ["xpsystem", "xptracking"],
    usage: "<on|off>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "status",
        description: "enabled or disabled",
        required: true,
        type: "STRING",
        choices: [
          {
            name: "ON",
            value: "ON",
          },
          {
            name: "OFF",
            value: "OFF",
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    if (!["on", "off"].includes(input)) return message.safeReply("Invalid status. Value must be `on/off`");
    const response = await setStatus(input, data.settings);
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await setStatus(interaction.options.getString("status"), data.settings);
    await interaction.followUp(response);
  },
};

async function setStatus(input, settings) {
  const status = input.toLowerCase() === "on" ? true : false;

  settings.ranking.enabled = status;
  await settings.save();

  return `Configuration saved! XP System is now ${status ? "enabled" : "disabled"}`;
}
