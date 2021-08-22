const { Command, CommandContext } = require("@src/structures");
const { getCommand, COMMANDS } = require("@features/command-handler");
const { EMOJIS, EMBED_COLORS, BOT_INVITE, SUPPORT_SERVER } = require("@root/config.js");
const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");

const CMD_CATEGORIES = {
  ADMIN: {
    name: "Admin",
    image: "https://icons.iconarchive.com/icons/dtafalonso/android-lollipop/512/Settings-icon.png",
    emoji: "\u2699",
  },
  AUTOMOD: {
    name: "Automod",
    image: "https://cdn3.iconfinder.com/data/icons/web-marketing-1-3/48/30-512.png",
    emoji: "\uD83D\uDEE1",
  },
  ECONOMY: {
    name: "Economy",
    image: "https://icons.iconarchive.com/icons/custom-icon-design/pretty-office-11/128/coins-icon.png",
    emoji: "\uD83E\uDE99",
  },
  FUN: {
    name: "Fun",
    image: "https://icons.iconarchive.com/icons/flameia/aqua-smiles/128/make-fun-icon.png",
    emoji: "\uD83D\uDE02",
  },
  IMAGE: {
    name: "Image",
    image: "https://icons.iconarchive.com/icons/dapino/summer-holiday/128/photo-icon.png",
    emoji: "\uD83D\uDDBC",
  },
  INVITE: {
    name: "Invite",
    image: "https://cdn4.iconfinder.com/data/icons/general-business/150/Invite-512.png",
    emoji: "\uD83D\uDCE8",
  },
  INFORMATION: {
    name: "Information",
    image: "https://icons.iconarchive.com/icons/graphicloads/100-flat/128/information-icon.png",
    emoji: "\uD83E\uDEA7",
  },
  MODERATION: {
    name: "Moderation",
    image: "https://icons.iconarchive.com/icons/lawyerwordpress/law/128/Gavel-Law-icon.png",
    emoji: "\uD83D\uDD28",
  },
  SOCIAL: {
    name: "Social",
    image: "https://icons.iconarchive.com/icons/dryicons/aesthetica-2/128/community-users-icon.png",
    emoji: "\uD83E\uDEC2",
  },
  TICKET: {
    name: "Ticket",
    image: "https://icons.iconarchive.com/icons/custom-icon-design/flatastic-2/512/ticket-icon.png",
    emoji: "🎫",
  },
  UTILITY: {
    name: "Utility",
    image: "https://icons.iconarchive.com/icons/blackvariant/button-ui-system-folders-alt/128/Utilities-icon.png",
    emoji: "\uD83D\uDEE0",
  },
};

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      description: "command help menu",
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    let invoke = ctx.args[0];
    if (!invoke) return sendSelectionHelpMenu(ctx);

    // check if category Help
    if (invoke.toUpperCase() === "INFO") invoke = "INFORMATION";
    if (CMD_CATEGORIES.hasOwnProperty(invoke.toUpperCase())) {
      const embed = getCategoryHelpEmbed(ctx, invoke.toUpperCase());
      return ctx.reply({ embeds: [embed] });
    }

    // check if command help
    const cmd = getCommand(invoke);
    if (cmd) return cmd.sendUsage(ctx.message.channel, ctx.prefix, ctx.args[0]);
    ctx.reply("No matching command or module found");
  }
};

/**
 * @param {CommandContext} ctx
 * @param {String} category
 */
function getCategoryHelpEmbed(ctx, category) {
  let collector = "";
  if (category === "IMAGE") {
    COMMANDS.filter((cmd) => cmd.category === category).forEach((cmd) =>
      cmd.aliases.forEach((alias) => (collector += "`" + alias + "`, "))
    );

    collector +=
      "\n\n" +
      "You can use these image commands in following formats\n" +
      " **" +
      ctx.prefix +
      "cmd:** Picks message authors avatar as image\n" +
      " **" +
      ctx.prefix +
      "cmd <@member>:** Picks mentioned members avatar as image\n" +
      " **" +
      ctx.prefix +
      "cmd <url>:** Picks image from provided URL\n" +
      " **" +
      ctx.prefix +
      "cmd [attachment]:** Picks attachment image";
  } else {
    const commands = COMMANDS.filter((cmd) => cmd.category === category);
    if (commands.length == 0) return ctx.reply(`No commands in this category`);
    commands.forEach((cmd) => {
      if (cmd.subcommands.length == 0) collector += `${EMOJIS.ARROW} \`${cmd.name}\` - ${cmd.description}\n`;
      else
        cmd.subcommands.forEach(
          (sub) => (collector += `${EMOJIS.ARROW} \`${cmd.name} ${sub.trigger}\`: ${sub.description}\n`)
        );
    });
  }

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(CMD_CATEGORIES[category].image)
    .setAuthor(category + " Commands")
    .setDescription(collector);

  return embed;
}

/**
 * @param {CommandContext} ctx
 */
async function sendSelectionHelpMenu(ctx) {
  const { message } = ctx;

  const options = [];
  for (let key in CMD_CATEGORIES) {
    if (CMD_CATEGORIES.hasOwnProperty(key)) {
      let value = CMD_CATEGORIES[key];
      let data = {
        label: value.name,
        value: value.name,
        description: `View commands in ${value.name} category`,
        emoji: value.emoji,
      };
      options.push(data);
    }
  }

  const row = new MessageActionRow().addComponents(
    new MessageSelectMenu().setCustomId("help-menu").setPlaceholder("Choose the command category").addOptions(options)
  );

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(
      `**About Me:**\nHello I am ${message.guild.me.displayName}!\nA cool multipurpose discord bot which can serve all your needs
      
      **Invite Me:** [Here](${BOT_INVITE}) 
      **Support Server:** [Join](${SUPPORT_SERVER})
      `
    )
    .setThumbnail(message.client.user.displayAvatarURL());

  const sentMsg = await ctx.reply({
    embeds: [embed],
    components: [row],
  });

  const collector = message.channel.createMessageComponentCollector({
    filter: (interaction) => interaction.user.id === message.author.id,
    max: 10,
    componentType: "SELECT_MENU",
    message: sentMsg,
    idle: 20 * 1000,
    dispose: true,
  });

  collector.on("collect", async (interaction) => {
    await interaction.deferUpdate();
    const value = interaction.values[0];
    let newEmbed = getCategoryHelpEmbed(ctx, value.toUpperCase());
    sentMsg.edit({ embeds: [newEmbed] });
  });

  collector.on("end", () => {
    sentMsg.edit({ components: [] });
  });
}
