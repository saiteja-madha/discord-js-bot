const { Command } = require("@src/structures");
const { Message } = require("discord.js");
const SnakeGame = require("snakecord");

module.exports = class SnackCommand extends Command {
  constructor(client) {
    super(client, {
      name: "snake",
      description: "Play Snack Game on Discord",
      cooldown: 120,
      command: {
        enabled: true,
        category: "FUN",
        botPermissions: ["EMBED_LINKS", "ADD_REACTIONS", "MANAGE_CHANNELS"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const snakeGame = new SnakeGame({
      title: "Snake Game",
      color: "BLUE",
      timestamp: true,
      gameOverTitle: "Game Over",
    });

    return snakeGame.newGame(message);
  }
};
