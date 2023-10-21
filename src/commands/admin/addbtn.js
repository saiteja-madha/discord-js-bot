const { containsLink } = require("@root/src/helpers/Utils");
const {
  ApplicationCommandOptionType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
  name: "add-btn",
  description: "add a button",
  category: "ADMIN",
  userPermissions: ["ManageMessages"],

  slashCommand: {
    ephemeral: true,
    enabled: true,
    options: [
      {
        name: "msgid",
        description: "Target Message ID (must be of my own)",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "label",
        description: "Button label",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "url",
        description: "URL to be assigned to the button",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const msgID = interaction.options.getString("msgid");
    const btnLabel = interaction.options.getString("label");
    const btnURL = interaction.options.getString("url");

    const response = await addButtons(interaction, msgID, btnLabel, btnURL);
    await interaction.followUp(response);
  },
};

/**
 * Function to add a button to a message
 * @param {import("discord.js").Message|import("discord.js").CommandInteraction} context
 * @param {string} msgID
 * @param {string} btnLabel
 * @param {string} URL
 * @returns {Promise<string>}
 */
async function addButtons(context, msgID, btnLabel, URL) {
  // Check input validity
  if (!containsLink(URL)) return "Please enter a valid URL";
  if (!isSnowflake(msgID)) return "Provided message ID is not valid";

  // Fetch the message from the channel
  let msg = await context.channel.messages.fetch(msgID);
  if (!msg) return "Failed to fetch the message!";
  if (msg.author.id !== context.client.user.id) return "Cannot edit a message authored by another user";

  // Get the existing action rows from the message, if any
  const oldActionRows = msg.components;
  if (oldActionRows.length === 5 && oldActionRows[4].components.length === 5) {
    return "Sorry, but you've reached the maximum number of buttons in a single message";
  }

  // Find the last action row that has less than 5 buttons
  let lastActionRowWithSpace;
  for (const actionRow of oldActionRows) {
    const buttonCount = actionRow.components.filter((component) => component.type === ComponentType.Button).length;
    if (buttonCount < 5) {
      lastActionRowWithSpace = actionRow;
      break;
    }
  }

  // Create a new ButtonComponent
  const ButtonComponent = new ButtonBuilder().setLabel(btnLabel).setStyle(ButtonStyle.Link).setURL(URL);

  // If there's a suitable action row, add the button to it; otherwise, create a new one
  if (lastActionRowWithSpace) {
    lastActionRowWithSpace.components.push(ButtonComponent);
  } else {
    const newActionRow = new ActionRowBuilder().addComponents(ButtonComponent);
    msg.components.push(newActionRow);
  }

  // Update the message with the modified action rows
  await msg.edit({
    components: msg.components,
  });

  return "Successfully added the button";
}

/**
 * Check if the provided ID is a snowflake
 * @param {string} snowflake
 */
function isSnowflake(snowflake) {
  const snowflakeRegex = /^[0-9]{17,19}$/;
  return snowflakeRegex.test(snowflake);
}
