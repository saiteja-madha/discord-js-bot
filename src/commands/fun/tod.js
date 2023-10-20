const { ApplicationCommandOptionType } = require("discord.js");
const { getQuestions, addQuestion, deleteQuestion } = require("@schemas/TruthOrDare");
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
        name: "random",
        description: "Get a random question",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "add",
        description: "Add a question",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "category",
            description: "Category of the question",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "Truth",
                value: "truth",
              },
              {
                name: "Dare",
                value: "dare",
              },
              {
                name: "Paranoia",
                value: "paranoia",
              },
              {
                name: "Never Have I Ever",
                value: "nhie",
              },
            ],
          },
          {
            name: "question",
            description: "The question to add",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "delete",
        description: "Delete a question",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "category",
            description: "Category of the question",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "Truth",
                value: "truth",
              },
              {
                name: "Dare",
                value: "dare",
              },
              {
                name: "Paranoia",
                value: "paranoia",
              },
              {
                name: "Never Have I Ever",
                value: "nhie",
              },
            ],
          },
          {
            name: "question_id",
            description: "ID of the question to delete",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
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
      case "random":
        sendRandomQuestion(interaction);
        break;
      case "add":
        const category = interaction.options.getString("category");
        const question = interaction.options.getString("question");
        const response = await addQuestion(category, question);
        await interaction.followUp(response);
        break;
      case "delete":
        const delCategory = interaction.options.getString("category");
        const questionId = interaction.options.getString("question_id");
        const delResponse = await deleteQuestion(delCategory, questionId);
        await interaction.followUp(delResponse);
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
      .setFooter({ text: `Question ID: ${question.questionId} | Requested by: ${interaction.user.tag}` });
    await interaction.followUp({ embeds: [embed] });
}
