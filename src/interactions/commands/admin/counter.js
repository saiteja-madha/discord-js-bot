const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { getMemberStats } = require("@utils/guildUtils");
const { getSettings } = require("@schemas/guild-schema");

module.exports = class Counter extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "counter",
      description: "setup counter channel in the guild",
      enabled: true,
      ephemeral: true,
      userPermissions: ["MANAGE_GUILD"],
      botPermissions: ["MANAGE_CHANNELS"],
      category: "ADMIN",
      options: [
        {
          name: "type",
          description: "type of counter channel",
          type: "STRING",
          required: true,
          choices: [
            {
              name: "all",
              value: "ALL",
            },
            {
              name: "members",
              value: "MEMBERS",
            },
            {
              name: "bots",
              value: "BOTS",
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
    let channelName = name;

    const settings = await getSettings(interaction.guild);

    const stats = await getMemberStats(interaction.guild);
    if (type === "ALL") channelName += ` : ${stats[0]}`;
    else if (type === "MEMBERS") channelName += ` : ${stats[2]}`;
    else if (type === "BOTS") channelName += ` : ${stats[1]}`;

    const vc = await interaction.guild.channels.create(channelName, {
      type: "GUILD_VOICE",
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ["CONNECT"],
        },
        {
          id: interaction.guild.me.id,
          allow: ["VIEW_CHANNEL", "MANAGE_CHANNELS", "CONNECT"],
        },
      ],
    });

    const exists = settings.counters.find((v) => v.counter_type === type);
    if (exists) {
      exists.name = name;
      exists.channel_id = vc.id;
    } else {
      settings.counters.push({
        counter_type: type,
        channel_id: vc.id,
        name,
      });
    }

    settings.data.bots = stats[1];
    await settings.save();
    await interaction.followUp("Configuration saved! Counter channel created");
  }
};
