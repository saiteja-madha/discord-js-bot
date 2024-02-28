const { 
  EmbedBuilder, 
  ApplicationCommandOptionType, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ComponentType,
} = require("discord.js");

module.exports = {
  name: "announce",
  description: "Create an announcement in a specified channel & pings @everyone",
  cooldown: 0,
  category: "MODERATION",
  memberpermissions: ['ADMINISTRATOR'],
  aliases: ["a"],
  usage: "[CHANNEL] [TITLE] [TEXT]",
  minArgsCount: 3,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "channel",
        description: "The channel to post the announcement in",
        type: 7, // CHANNEL
        required: true,
      },
      {
        name: "title",
        description: "The title of the announcement",
        type: 3, // STRING
        required: true,
      },
      {
        name: "text",
        description: "The text of the announcement(put backwords / n without the space to do line breaks)",
        type: 3, // STRING,
        required: true,
      },
      {
        name: "color",
        description: "The color of the announcement embed (in hex code format)",
        type: 3, // STRING
        required: false,
      },
      {
        name: "image",
        description: "The URL of the image to include in the announcement embed",
        type: 3, // STRING,
        required: false,
      },
      {
        name: "footer",
        description: "The text to display in the footer of the announcement embed",
        type: 3, // STRING,
        required: false,
      },
      {
        name: "message_id",
        description: "The ID of the announcement message to edit",
        type: 3, // STRING
        required: false,
      },
    ],
  },

async messageRun(message, args, data) {
  // Check if the command has enough arguments
  if (args.length < 3) {
    return message.channel.send("Missing required arguments: [CHANNEL] [TITLE] [TEXT]");
  }
  // Get the channel, title, and text from the command arguments
  const channel = message.mentions.channels.first();
  const title = args[0];
  const image = args[1];
  const text = args.slice(2).join(" ");
  const color = "#0099ff";
  const footer = args[3] || "";
  const messageId = args[4];

  // Create an embed with the announcement information and color
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(text.replace(/\\n/g, "\n"));

  // Add the image to the embed, if provided
  if (image) {
    embed.setImage(image);
  }

  // Add the footer to the embed, if provided
  if (footer) {
    embed.setFooter({ text: footer });
  }

  // If messageId is provided, edit the existing message
  if (messageId) {
    try {
      const message = await channel.messages.fetch(messageId);
      await message.edit({ embeds: [embed] });
      await message.channel.send({ content: "@everyone", allowedMentions: { parse: ["everyone"] } });
      await message.channel.send(`Announcement embed edited in ${channel}`);
    } catch (err) {
      console.error(err);
      await message.channel.send(`Failed to edit announcement embed in ${channel}`);
    }
  } else {
    // If messageId is not provided, send a new message
    const sentMessage = await channel.send({ embeds: [embed] });
    await channel.send({ content: "@everyone", allowedMentions: { parse: ["everyone"] } });
    await message.channel.send(`Announcement embed sent in ${channel}`);
  }
},

async interactionRun(interaction, data) {
  // Get the channel, title, and text from the slash command
  const channel = interaction.options.getChannel("channel");
  const title = interaction.options.getString("title");
  const image = interaction.options.getString("image");
  const text = interaction.options.getString("text");
  const color = interaction.options.getString("color") || "#0099ff";
  const footer = interaction.options.getString("footer");
  const messageId = interaction.options.getString("message_id");


  // Create an embed with the announcement information and color
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(text.replace(/\\n/g, "\n"));

  // Add the image to the embed, if provided
  if (image) {
    embed.setImage(image);
  }

  // Add the footer to the embed, if provided
  if (footer) {
    embed.setFooter({ text: footer });
  }

  // If message_id is provided, edit the existing message
  if (messageId) {
    try {
      const message = await channel.messages.fetch(messageId);
      await message.edit({ embeds: [embed] });
      await interaction.followUp({
        content: `Announcement embed edited in ${channel}`,
        ephemeral: false,
      });
    } catch (err) {
      console.error(err);
      await interaction.followUp({
        content: `Failed to edit announcement embed in ${channel}`,
        ephemeral: true,
      });
    }
  } else {
    // If message_id is not provided, send a new message
    const sentMessage = await channel.send({ embeds: [embed] });
    await channel.send({ content: "@everyone", allowedMentions: { parse: ["everyone"] } });
    await interaction.followUp({
      content: `Announcement embed sent in ${channel}`,
      ephemeral: false,
    });
  }
}
};
