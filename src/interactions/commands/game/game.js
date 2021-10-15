const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const SnakeGame = require("snakecord");

const snakePerms = ["SEND_MESSAGES", "EMBED_LINKS", "ADD_REACTIONS", "READ_MESSAGE_HISTORY", "MANAGE_MESSAGES"];

module.exports = class GameCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "game",
      description: "have fun playing games in discord",
      enabled: true,
      cooldown: 30,
      category: "FUN",
      options: [
        {
          name: "snake",
          description: "start a snake game",
          type: "SUB_COMMAND",
        },
      ],
      userPermissions: ["READ_MESSAGE_HISTORY", "MANAGE_MESSAGES"],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const channel = interaction.channel;
    const sub = interaction.options.getSubcommand();

    if (sub === "snake") {
      if (!channel.permissionsFor(interaction.guild.me).has(snakePerms)) {
        return interaction.followUp(`I need ${this.parsePermissions(snakePerms)} in this channel`);
      }

      await interaction.deleteReply();
      const snakeGame = new SnakeGame({
        title: "Snake Game",
        color: "BLUE",
        timestamp: true,
        gameOverTitle: "Game Over",
      });

      await snakeGame.newGame(interaction);
    }
  }
};
