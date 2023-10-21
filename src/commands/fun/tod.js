const { ApplicationCommandOptionType } = require("discord.js");
const { getQuestions } = require("@schemas/TruthOrDare");
const { EmbedBuilder } = require("discord.js");
const { getUsername } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "tod",
  description: "Play Truth or Dare!",
  category: "FUN",
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "truth",
        description: "Get a truth question",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "dare",
        description: "Get a dare question",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "paranoia",
        description: "Get a paranoia question",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "nhie",
        description: "Get a 'Never Have I Ever' question",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "wyr",
        description: "Get a 'Would you rather' question",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "hye",
        description: "Get a 'Have you ever' question",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "wwyd",
        description: "Get a 'What would you do' question",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "random",
        description: "Get a random question",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
  async interactionRun(interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "truth":
        sendQuestion(interaction, "truth");
        break;
      case "dare":
        sendQuestion(interaction, "dare");
        break;
      case "paranoia":
        sendQuestion(interaction, "paranoia");
        break;
      case "nhie":
        sendQuestion(interaction, "nhie");
        break;
      case "wyr":
        sendQuestion(interaction, "wyr");
        break;
      case "hye":
        sendQuestion(interaction, "hye");
        break;
      case "wwyd":
        sendQuestion(interaction, "wwyd");
        break;
      case "random":
        sendRandomQuestion(interaction);
        break;
    }
  },
};

async function sendQuestion(interaction, category) {
  const questions = await getQuestions(1, category);
  if (questions.length === 0) {
    await interaction.followUp("No questions available in the specified category.");
    return;
  }

  const question = questions[0];
  const embed = new EmbedBuilder()
    .setColor("Blue")
    .setTitle("Truth or Dare")
    .setDescription(question.question)
    .setFooter({
      text: `Category: ${category} | Question ID: ${question.questionId} | Requested by: ${interaction.user.tag}`,
    });
  await interaction.followUp({ embeds: [embed] });
}

async function sendRandomQuestion(interaction) {
  const questions = await getQuestions(1);
  if (questions.length === 0) {
    await interaction.followUp("No questions available.");
    return;
  }

  const question = questions[0];
  const embed = new EmbedBuilder()
    .setColor("Blue")
    .setTitle("Truth or Dare")
    .setDescription(question.question)
    .setFooter({
      text: `Category: Random | Question ID: ${question.questionId} | Requested by: ${interaction.user.tag}`,
    });
  await interaction.followUp({ embeds: [embed] });
}
