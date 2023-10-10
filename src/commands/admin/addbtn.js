const { containsLink } = require("@root/src/helpers/Utils");
const { 
    ApplicationCommandOptionType , 
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
    cooldown: 0,
    category: "ADMIN",
    userPermissions: ["ManageMessages"],
    command: {
      enabled: true,
      aliases: ["addbtn"],
      usage: "[Message ID] [Button Label] [Button URL]",
      minArgsCount: 3,
    },
    slashCommand: {
      ephemeral: true,
      enabled: true,
      options: [
        {
            name: "msgid",
            description: "Target Message ID (must be of my own)",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "label",
            description: "Button label",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "url",
            description: "URL to be assigned to the button",
            type: ApplicationCommandOptionType.String,
            required: true
        }
      ],
    },
  
    async messageRun(message, args) {
        const msgID = args[0];
        const btnLabel = args.slice(1, -1).join(' ');
        const btnURL = args[args.length - 1];

        const response = await addButtons(message, msgID, btnLabel, btnURL);
        await message.safeReply(response);
    },
    async interactionRun(interaction) {
        const msgID = interaction.options.getString("msgid");
        const btnLabel = interaction.options.getString("label");
        const btnURL = interaction.options.getString("url");

        const response = await addButtons(interaction, msgID, btnLabel, btnURL);
        await interaction.followUp(response);
    }    
}

/**
 * Function to add button
 * @param {import("discord.js").Message|import("discord.js").CommandInteraction} context
 * @param {string} msgID 
 * @param {string} btnLabel 
 * @param {string} URL
 * @returns {Promise<string>}
 */
async function addButtons(context, msgID, btnLabel, URL) {
    // Checking input
    if(!containsLink(URL)) return "Please Enter a valid URL";
    if(!isSnowflake(msgID)) return "Provided message ID not a valid ID";

    // Fetching message from channel
    let msg = await context.channel.messages.fetch(msgID);
    if (!msg) return "Failed to fetch message!";
    if(msg.author.id !== context.client.user.id) return "Cannot edit a message authored by another user";

    // Get the existing action rows from the message, if any
    const oldActionRows = msg.components;
    if(oldActionRows.length == 5 && oldActionRows[4].components.length == 5) return "Sorry but you've reached the max amount of buttons in single message";
    
    // Find the last action row, if any, that has less than 5 buttons
    let lastActionRowWithSpace;
    for (const actionRow of oldActionRows) {
        const buttonCount = actionRow.components.filter(component => component.type === ComponentType.Button).length;
        if (buttonCount < 5) {
            lastActionRowWithSpace = actionRow;
            break;
        }
    }

    // If there's a suitable action row, add the button to it; otherwise, create a new one
    const ButtonComponent = new ButtonBuilder()
        .setLabel(btnLabel)
        .setStyle(ButtonStyle.Link)
        .setURL(URL);

    if (lastActionRowWithSpace) {
        lastActionRowWithSpace.components.push(ButtonComponent);
    } else {
        const newActionRow = new ActionRowBuilder().addComponents(ButtonComponent);
        msg.components.push(newActionRow);
    }

    // Update the message with the modified action rows
    await msg.edit({
        components: msg.components
    });
    
    return "Successfully added button";
}

/**
 * Check if provided ID is a snowflake
 * @param {string} snowflake 
 */
function isSnowflake(snowflake) {
    const snowflakeRegex = /^[0-9]{17,19}$/;
    return snowflakeRegex.test(snowflake);
}