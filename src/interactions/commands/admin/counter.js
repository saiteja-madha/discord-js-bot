const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { getMemberStats } = require("@utils/guildUtils");
const db = require("@schemas/counter-schema");

module.exports = class Counter extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "counter",
      description: "setup counter channel in the guild",
      enabled: true,
      ephemeral: true,
      userPermissions: ["MANAGE_GUILD"],
      options: [
        {
          name: "type",
          description: "type of counter channel",
          type: "STRING",
          required: true,
          choices: [
            {
              name: "all",
              value: "total user count",
            },
            {
              name: "members",
              value: "guild members count",
            },
            {
              name: "bots",
              value: "guild bots count",
            },
          ],
        },
        {
          name: "name",
          description: "name of the counter channel",
          type: "STRING",
          required: true,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const type = interaction.options.getString("type");
    const name = interaction.options.getString("name");
    let channelName = "";

    const stats = await getMemberStats(interaction.guild);
    if (type === "all") channelName += ` : ${stats[0]}`;
    else if (type === "members") channelName += ` : ${stats[2]}`;
    else if (type === "bots") channelName += ` : ${stats[1]}`;

    const vc = await interaction.guild.channels.create(channelName, {
      type: "GUILD_VOICE",
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ["CONNECT"],
        },
        {
          id: interaction.guild.me.roles.highest.id,
          allow: ["VIEW_CHANNEL", "MANAGE_CHANNELS", "MANAGE_ROLES"],
        },
      ],
    });

    if (type === "all") await db.setTotalCountChannel(interaction.guildId, vc.id, name);
    if (type === "members") await db.setMemberCountChannel(interaction.guildId, vc.id, name);
    if (type === "bots") await db.setBotCountChannel(interaction.guildId, vc.id, name);

    await db.updateBotCount(interaction.guildId, stats[1], false);

    return interaction.followUp("Configuration saved! Counter channel created");
  }
};
