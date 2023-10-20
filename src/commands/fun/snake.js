const SnakeGame = require("snakecord");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "snake",
  description: "Play a snake game on Discord",
  cooldown: 300,
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks", "AddReactions", "ReadMessageHistory", "ManageMessages"],
  slashCommand: {
    enabled: true,
  },

  async interactionRun(interaction) {
    await interaction.followUp("**Starting Snake Game**");
    await startSnakeGame(interaction);
  },
};

async function startSnakeGame(interaction) {
  const snakeGame = new SnakeGame({
    title: "Snake Game",
    color: "BLUE",
    timestamp: true,
    gameOverTitle: "Game Over",
  });

  await snakeGame.newGame(interaction);
}
