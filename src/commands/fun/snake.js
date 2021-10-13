const { Command } = require("@src/structures");
const { Message, MessageInteraction } = require("discord.js");
const SnakeGame = require("snakecord");

module.exports = class SnakeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "snake",
      description: "Play the Snake Game on Discord",
      cooldown: 120,
      command: {
        enabled: true,
        category: "FUN",
        botPermissions: ["EMBED_LINKS", "ADD_REACTIONS", "MANAGE_CHANNELS"],
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "snake",
            description: "Play the Snake Game on Discord",
            type: "STRING",
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
    const snakeGame = new SnakeGame({
      title: "Snake Game",
      color: "BLUE",
      timestamp: true,
      gameOverTitle: "Game Over",
    });

    return snakeGame.newGame(message);
  }



/** 
* @param {CommandInteraction} interaction
*/
  async interactionRun(message, args) {
    const snakeGame = new SnakeGame({
      title: "Snake Game",
      color: "BLUE",
      timestamp: true,
      gameOverTitle: "Game Over",
    });
    return snakeGame.newGame(message);
  }
}
