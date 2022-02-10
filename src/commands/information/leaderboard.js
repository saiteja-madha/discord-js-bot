const { Command } = require("@src/structures");
const { Message, MessageEmbed, CommandInteraction } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { getSettings } = require("@schemas/Guild");
const { getXpLb, getInvitesLb } = require("@schemas/Member");

module.exports = class LeaderBoard extends Command {
  constructor(client) {
    super(client, {
      name: "leaderboard",
      description: "display the XP leaderboard",
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        aliases: ["lb"],
        minArgsCount: 1,
        usage: "<xp|invite>",
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "type",
            description: "type of leaderboard to display",
            required: true,
            type: "STRING",
            choices: [
              {
                name: "xp",
                value: "xp",
              },
              {
                name: "invite",
                value: "invite",
              },
            ],
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
    const type = args[0].toLowerCase();
    let response;

    if (type === "xp") response = await getXpLeaderboard(message, message.author);
    else if (type === "invite") response = await getInviteLeaderboard(message, message.author);
    else response = "Invalid Leaderboard type. Choose either `xp` or `invite`";
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const type = interaction.options.getString("type");
    let response;

    if (type === "xp") response = await getXpLeaderboard(interaction, interaction.user);
    else if (type === "invite") response = await getInviteLeaderboard(interaction, interaction.user);
    else response = "Invalid Leaderboard type. Choose either `xp` or `invite`";

    await interaction.followUp(response);
  }
};

async function getXpLeaderboard({ guild }, author) {
  const settings = await getSettings(guild);
  if (!settings.ranking.enabled) return "Ranking is disabled on this server";

  const lb = await getXpLb(guild.id, 10);
  if (lb.length === 0) return "No users in the leaderboard";

  let collector = "";
  for (let i = 0; i < lb.length; i++) {
    try {
      const user = await author.client.users.fetch(lb[i].member_id);
      collector += `**#${(i + 1).toString()}** - ${user.tag}\n`;
    } catch (ex) {
      // Ignore
    }
  }

  const embed = new MessageEmbed()
    .setAuthor({ name: "XP Leaderboard" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(collector)
    .setFooter({ text: `Requested by ${author.tag}` });

  return { embeds: [embed] };
}

async function getInviteLeaderboard({ guild }, author) {
  const settings = await getSettings(guild);
  if (!settings.invite.tracking) return "Invite tracking is disabled on this server";

  const lb = await getInvitesLb(guild.id, 10);
  if (lb.length === 0) return "No users in the leaderboard";

  let collector = "";
  for (let i = 0; i < lb.length; i++) {
    try {
      const user = await author.client.users.fetch(lb[i].member_id);
      collector += `**#${(i + 1).toString()}** - ${user.tag} [${lb[i].invites}]\n`;
    } catch (ex) {
      // Ignore
    }
  }

  const embed = new MessageEmbed()
    .setAuthor({ name: "Invite Leaderboard" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(collector)
    .setFooter({ text: `Requested by ${author.tag}` });

  return { embeds: [embed] };
}
