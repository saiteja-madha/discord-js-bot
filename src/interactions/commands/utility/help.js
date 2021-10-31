const { SlashCommand, CommandCategory } = require("@src/structures");
const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, CommandInteraction } = require("discord.js");
const { EMBED_COLORS, SUPPORT_SERVER } = require("@root/config.js");

const CMDS_PER_PAGE = 5;
const TIMEOUT_IN_SECONDS = 30;
const cache = {};

module.exports = class HelpCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "help",
      description: "feeling lost ❓",
      enabled: true,
      options: [
        {
          name: "command",
          description: "name of the command",
          required: false,
          type: "STRING",
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    let cmdName = interaction.options.getString("command");

    // !help
    if (!cmdName) {
      return this.sendHelpMenu(interaction);
    }

    // check if command help (!help cat)
    const cmd = this.client.slashCommands.get(cmdName);
    if (cmd) {
      const embed = cmd.getHelpEmbed();
      return interaction.followUp({ embeds: [embed] });
    }

    // No matching command/category found
    return interaction.followUp("No matching command found");
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async sendHelpMenu(interaction) {
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
      new MessageButton().setCustomId("previousBtn").setEmoji("⬅️").setStyle("SECONDARY").setDisabled(true),
      new MessageButton().setCustomId("nextBtn").setEmoji("➡️").setStyle("SECONDARY").setDisabled(true)
    );

    let buttonsRow = new MessageActionRow().addComponents(components);

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setDescription(
        "**About Me:**\n" +
          `Hello I am ${interaction.guild.me.displayName}!\n` +
          "A cool multipurpose discord bot which can serve all your needs\n\n" +
          `**Invite Me:** [Here](${interaction.client.getInvite()})\n` +
          `**Support Server:** [Join](${SUPPORT_SERVER})`
      );

    await interaction.followUp({
      embeds: [embed],
      components: [menuRow, buttonsRow],
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: (reactor) => reactor.user.id === interaction.user.id,
      idle: TIMEOUT_IN_SECONDS * 1000,
      dispose: true,
    });

    let arrEmbeds = [];
    let currentPage = 0;

    collector.on("collect", async (response) => {
      await response.deferUpdate();

      switch (response.customId) {
        case "help-menu":
          arrEmbeds = this.getCategoryEmbeds(interaction, response.values[0].toUpperCase());
          components = [];
          currentPage = 0;
          buttonsRow.components.forEach((button) => button.setDisabled(arrEmbeds.length > 1 ? false : true));

          await interaction.editReply({
            embeds: [arrEmbeds[currentPage]],
            components: [menuRow, buttonsRow],
          });
          break;

        case "previousBtn":
          if (currentPage !== 0) {
            --currentPage;
            await interaction.editReply({
              embeds: [arrEmbeds[currentPage]],
              components: [menuRow, buttonsRow],
            });
          }
          break;

        case "nextBtn":
          if (currentPage < arrEmbeds.length - 1) {
            currentPage++;
            await interaction.editReply({
              embeds: [arrEmbeds[currentPage]],
              components: [menuRow, buttonsRow],
            });
          }
          break;
      }
    });

    collector.on("end", () => {
      return interaction.editReply({
        components: [],
      });
    });
  }

  /**
   * Returns an array of message embeds for a particular command category
   * @param {CommandInteraction} interaction
   * @param {String} category
   */
  getCategoryEmbeds(interaction, category) {
    if (cache[category]) return cache[category]; // check cache first
    let collector = "";

    // For IMAGE Category
    if (category === "IMAGE") {
      interaction.client.slashCommands
        .filter((cmd) => cmd.category === category)
        .forEach((cmd) => (collector += `\`/${cmd.name}\`\n ❯ ${cmd.description}\n\n`));

      const availableFilters = interaction.client.slashCommands
        .get("filter")
        .options[0].choices.map((ch) => ch.name)
        .join(", ");

      const availableGens = interaction.client.slashCommands
        .get("generator")
        .options[0].choices.map((ch) => ch.name)
        .join(", ");

      collector +=
        "\n**Available Filters:**\n" + `${availableFilters}` + `*\n\n**Available Generators**\n` + `${availableGens}`;

      const embed = new MessageEmbed()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(CommandCategory[category].image)
        .setAuthor(`${category} Commands`)
        .setDescription(collector);

      cache[category] = [embed]; // cache and return
      return [embed];
    }

    // For REMAINING Categories
    const commands = Array.from(interaction.client.slashCommands.filter((cmd) => cmd.category === category));

    if (commands.length === 0) {
      const embed = new MessageEmbed()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(CommandCategory[category].image)
        .setAuthor(`${category} Commands`)
        .setDescription("No commands in this category");

      cache[category] = [embed]; // cache and return
      return [embed];
    }

    const arrSplitted = [];
    const arrEmbeds = [];

    while (commands.length) {
      let toAdd = commands.splice(0, commands.length > CMDS_PER_PAGE ? CMDS_PER_PAGE : commands.length);

      toAdd = toAdd.map((value) => {
        const cmd = value[1];
        const subCmds = cmd.options.filter((opt) => opt.type === "SUB_COMMAND");
        const subCmdsString = subCmds.map((s) => s.name).join(", ");

        return `\`/${cmd.name}\`\n ❯ **Description**: ${cmd.description}\n ${
          subCmds == 0 ? "" : `❯ **SubCommands [${subCmds.length}]**: ${subCmdsString}\n`
        } `;
      });

      arrSplitted.push(toAdd);
    }

    arrSplitted.forEach((item, index) => {
      const embed = new MessageEmbed()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(CommandCategory[category].image)
        .setAuthor(`${category} Commands`)
        .setDescription(item.join("\n"))
        .setFooter(`page ${index + 1} of ${arrSplitted.length}`);
      arrEmbeds.push(embed);
    });

    cache[category] = arrEmbeds; // cache and return
    return arrEmbeds;
  }
};
