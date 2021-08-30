const { Command } = require("@src/structures");
const { MessageEmbed, Message, CommandInteraction, CommandInteractionOptionResolver } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class UserInfo extends Command {
  constructor(client) {
    super(client, {
      name: "userinfo",
      description: "shows information about the user",
      command: {
        enabled: true,
        usage: "[@member|id]",
        aliases: ["uinfo", "memberinfo"],
        category: "INFORMATION",
        botPermissions: ["EMBED_LINKS"],
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "user",
            description: "the user to get the information for",
            type: "USER",
            required: false,
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const target = (await resolveMember(message, args[0])) || message.member;
    const embed = buildEmbed(target);
    message.channel.send({ embeds: [embed] });
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  async interactionRun(interaction, options) {
    const target = options.getUser("target") || interaction.user;
    const embed = buildEmbed(target);
    interaction.followUp({ embeds: [embed] });
  }
};

const buildEmbed = (member) => {
  // color
  let color = member.displayHexColor;
  if (color === "#000000") color = EMBED_COLORS.BOT_EMBED;

  const embed = new MessageEmbed()
    .setAuthor(`User information for ${member.displayName}`, member.user.displayAvatarURL())
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(color)
    .addField("User Tag", member.user.tag, true)
    .addField("ID", member.id, true)
    .addField("Guild Joined", member.joinedAt.toUTCString())
    .addField("Discord Registered", member.user.createdAt.toUTCString())
    .addField(`Roles [${member.roles.cache.size}]`, member.roles.cache.map((r) => r.name).join(", "), false)
    .addField("Avatar-URL", member.user.displayAvatarURL({ format: "png" }))
    .setFooter(`Requested by ${member.user.tag}`)
    .setTimestamp(Date.now());

  return embed;
};
