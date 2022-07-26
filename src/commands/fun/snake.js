const SnakeGame = require("snakecord");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "snake",
  description: "play snake game on discord",
  cooldown: 300,
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks", "AddReactions", "ReadMessageHistory", "ManageMessages"],
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    await message.safeReply("**Starting Snake Game**");
    await startSnakeGame(message);
  },

  async interactionRun(interaction) {
    await interaction.followUp("**Starting Snake Game**");
    await startSnakeGame(interaction);
  },
};

async function startSnakeGame(data) {
  const snakeGame = new SnakeGame({
    title: "Snake Game",
    color: "BLUE",
    timestamp: true,
    gameOverTitle: "Game Over",
  });

  await snakeGame.newGame(data);
}
