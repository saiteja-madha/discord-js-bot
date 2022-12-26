const { TicTacToe } = require("discord-gamecord");
const { ApplicationCommandOptionType, EmbedBuilder} = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
  name: "tictactoe",
  description: "Play Tic Tac Toe with your friends",
  cooldown: 15,
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks", "AddReactions", "ReadMessageHistory", "ManageMessages"],
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    ephermal: true,
    options: [
      {
        name: "user",
        description: "Select a user to play",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const Game = new TicTacToe({
      message: interaction,
      isSlashGame: true,
      opponent: interaction.options.getUser("user"),
      embed: {
        title: "Tic Tac Toe",
        color: "#5865F2",
        statusTitle: "Status",
        overTitle: "Game Over",
      },
      emojis: {
        xButton: "❌",
        oButton: "🔵",
        blankButton: "➖",
      },
      mentionUser: true,
      timeoutTime: 60000,
      xButtonStyle: "DANGER",
      oButtonStyle: "PRIMARY",
      turnMessage: "{emoji} | Its turn of player **{player}**.",
      winMessage: "{emoji} | **{player}** won the TicTacToe Game.",
      tieMessage: "The Game tied! No one won the Game!",
      timeoutMessage: "The Game went unfinished! No one won the Game!",
      playerOnlyMessage: "Only {player} and {opponent} can use these buttons.",
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      console.log(result); // =>  { result... }
      const winners = result.winner;
      const winner = `<@${winners}>`;
      if (result.result === "tie") {
        const embed = new EmbedBuilder()
          .setTitle("Tic Tac Toe")
          .setDescription("The Game tied! No one won the Game!")
          .setColor("Red")
          .setTimestamp();
        interaction.followUp({ embeds: [embed] });
      } else if (result.result === "win") {
        const embed = new EmbedBuilder()
          .setTitle("Tic Tac Toe")
          .setDescription(`${winner} won the TicTacToe Game.`)
          .setColor("Green")
          .setTimestamp();

        interaction.followUp({ embeds: [embed] });
      }
    });
  },
};
