const { Command } = require("@src/structures");
const { Message, CommandInteraction, CommandInteractionOptionResolve, MessageEmbed } = require("discord.js");
const SnakeGame = require('snakecord');

module.exports = class SnackCommand extends Command {
  constructor(client) {
    super(client, {
      name: "snack",
      description: "Play Snack Game on Discord",
      command: {
        enabled: true,
        category: "FUN",
      },
      slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
            const snakeGame = new SnakeGame({
            title: 'Snake Game',
            color: "BLUE",
            timestamp: true,
            gameOverTitle: "<a:GameOver:823784027713699841> Game Over"
        });
        return snakeGame.newGame(message);
    }
}
