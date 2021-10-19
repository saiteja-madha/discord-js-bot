const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { checkMusic } = require("@utils/botUtils");

module.exports = class LoopCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "loop",
      description: "loops the song or queue",
      enabled: true,
      category: "MUSIC",
      options: [
        {
          name: "type",
          type: "STRING",
          description: "The entity you want to loop",
          required: false,
          choices: [
            {
              name: "queue",
              value: "queue",
            },
            {
              name: "track",
              value: "track",
            },
          ],
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const player = interaction.client.musicManager.get(interaction.guildId);

    const playable = checkMusic(member, player);
    if (typeof playable !== "boolean") return interaction.followUp(playable);

    const type = interaction.options.getString("type") || "track";

    // track
    if (type === "track") {
      player.setTrackRepeat(!player.trackRepeat);
      return interaction.followUp(`Track loop ${player.trackRepeat ? "enabled" : "disabled"}`);
    }

    // queue
    else if (type === "queue") {
      player.setQueueRepeat(!player.queueRepeat);
      return interaction.followUp(`Queue loop ${player.queueRepeat ? "enabled" : "disabled"}`);
    }
  }
};
