const { Command, CommandCategory } = require("@src/structures");
const { EMOJIS, EMBED_COLORS, BOT_INVITE, SUPPORT_SERVER } = require("@root/config.js");
const { MessageEmbed, MessageActionRow, MessageSelectMenu, Message, MessageButton } = require("discord.js");

const MAX_CMDS_PER_EMBED = 7;

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      description: "command help menu",
      command: {
        enabled: true,
        usage: "[command]",
        category: "UTILITY",
        botPermissions: ["EMBED_LINKS"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   * @param {string} invoke
   * @param {string} prefix
   */
  async messageRun(message, args, invoke, prefix) {
    let trigger = args[0];

    // !help
    if (!trigger) {
      return sendHelpMenu(message, prefix);
    }

    // check if command help (!help cat)
    const cmd = this.client.getCommand(trigger);
    if (cmd) return cmd.sendUsage(message.channel, prefix, trigger);

    // No matching command/category found
    message.reply("No matching command or module found");
  }
};

/**
 * @param {Message} message
 * @param {string} prefix
 */
async function sendHelpMenu(message, prefix) {
  // Menu Row
  const options = [];
  const keys = Object.keys(CommandCategory);
  keys.forEach((key) => {
    const value = CommandCategory[key];
    const data = {
      label: value.name,
      value: value.name,
      description: `View commands in ${value.name} category`,
      emoji: value.emoji,
    };
    options.push(data);
  });

  const menuRow = new MessageActionRow().addComponents(
    new MessageSelectMenu().setCustomId("help-menu").setPlaceholder("Choose the command category").addOptions(options)
  );

  // Buttons Row
  let components = [];
  components.push(
    new MessageButton().setCustomId("previousbtn").setEmoji("⬅️").setStyle("SUCCESS").setDisabled(true),
    new MessageButton().setCustomId("nextbtn").setEmoji("➡️").setStyle("SUCCESS").setDisabled(true),
    new MessageButton().setLabel("Invite Me").setStyle("LINK").setURL(`${BOT_INVITE}`).setDisabled(false),
    new MessageButton().setLabel("Support Server").setStyle("LINK").setURL(`${SUPPORT_SERVER}`).setDisabled(false)
  );

  let buttonsRow = new MessageActionRow().addComponents(components);

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(message.client.user.displayAvatarURL())
    .setDescription(
      "**About Me:**\n" +
        `Hello I am ${message.guild.me.displayName}!\n` +
        "A cool multipurpose discord bot which can serve all your needs\n\n" +
        `**Invite Me:** [Here](${BOT_INVITE})\n` +
        `**Support Server:** [Join](${SUPPORT_SERVER})`
    );

  const sentMsg = await message.channel.send({
    embeds: [embed],
    components: [menuRow, buttonsRow],
  });

  const collector = message.channel.createMessageComponentCollector({
    filter: (interaction) => interaction.user.id === message.author.id,
    message: sentMsg,
    idle: 999999999,
    dispose: true,
  });

  let arrEmbeds = [];
  let currentPage = 0;

  collector.on("collect", async (interaction) => {
    await interaction.deferUpdate();

    switch (interaction.customId) {
      case "help-menu":
        arrEmbeds = getCategoryEmbeds(message, interaction.values[0].toUpperCase(), prefix);
        components = [];
        currentPage = 0;
        buttonsRow.components.forEach((button) => button.setDisabled(arrEmbeds.length > 1 ? false : true));

        await sentMsg.edit({
          embeds: [arrEmbeds[currentPage]],
          components: [menuRow, buttonsRow],
        });
        break;

      case "previousbtn":
        if (currentPage !== 0) {
          --currentPage;
          await sentMsg.edit({
            embeds: [arrEmbeds[currentPage]],
            components: [menuRow, buttonsRow],
          });
        }
        break;

      case "nextbtn":
        if (currentPage < arrEmbeds.length - 1) {
          currentPage++;
          await sentMsg.edit({
            embeds: [arrEmbeds[currentPage]],
            components: [menuRow, buttonsRow],
          });
        }
        break;
    }
  });

  collector.on("end", () => {
    if (sentMsg && sentMsg.editable) sentMsg.edit({ components: [] });
  });
}

/**
 * Returns an array of message embeds for a particular command category
 * @param {Message} message
 * @param {String} category
 */
function getCategoryEmbeds(message, category, prefix) {
  let collector = "";

  // For IMAGE Category
  if (category === "IMAGE") {
    message.client.commands
      .filter((cmd) => cmd.command.category === category)
      .forEach((cmd) =>
        cmd.command.aliases.forEach((alias) => {
          collector += `\`${alias}\`, `;
        })
      );

    collector +=
      "\n\nYou can use these image commands in following formats\n" +
      `**${prefix}cmd:** Picks message authors avatar as image\n` +
      `**${prefix}cmd <@member>:** Picks mentioned members avatar as image\n` +
      `**${prefix}cmd <url>:** Picks image from provided URL\n` +
      `**${prefix}cmd [attachment]:** Picks attachment image`;

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(CommandCategory[category].image)
      .setAuthor(`${category} Commands`)
      .setDescription(collector);

    return [embed];
  }

  // For REMAINING Categories
  const commands = message.client.commands.filter((cmd) => cmd.command.category === category);

  if (commands.length === 0) {
    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(CommandCategory[category].image)
      .setAuthor(`${category} Commands`)
      .setDescription("No commands in this category");

    return [embed];
  }

  const arrSplitted = [];
  const arrEmbeds = [];

  while (commands.length) {
    let toAdd = commands.splice(0, commands.length > MAX_CMDS_PER_EMBED ? MAX_CMDS_PER_EMBED : commands.length);
    toAdd = toAdd.map((cmd) => `**${cmd.name}**\n ${EMOJIS.ARROW} ${cmd.description}`);
    arrSplitted.push(toAdd);
  }

  arrSplitted.forEach((item, index) => {
    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(CommandCategory[category].image)
      .setAuthor(`${category} Commands`)
      .setDescription(item.join("\n"))
      .setFooter(
        `page ${index + 1} of ${arrSplitted.length} | Type ${prefix}help <command> for more command information`
      );
    arrEmbeds.push(embed);
  });

  return arrEmbeds;
}
