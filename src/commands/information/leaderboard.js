const { EmbedBuilder, escapeInlineCode, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { getInvitesLb } = require("@schemas/Member");
const { getXpLb } = require("@schemas/MemberStats");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "leaderboard",
  description: "display the XP leaderboard",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
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
        type: ApplicationCommandOptionType.String,
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

  async messageRun(message, args, data) {
    const type = args[0].toLowerCase();
    let response;

    if (type === "xp") response = await getXpLeaderboard(message, message.author, data.settings);
    else if (type === "invite") response = await getInviteLeaderboard(message, message.author, data.settings);
    else response = "Invalid Leaderboard type. Choose either `xp` or `invite`";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const type = interaction.options.getString("type");
    let response;

    if (type === "xp") response = await getXpLeaderboard(interaction, interaction.user, data.settings);
    else if (type === "invite") response = await getInviteLeaderboard(interaction, interaction.user, data.settings);
    else response = "Invalid Leaderboard type. Choose either `xp` or `invite`";

    await interaction.followUp(response);
  },
};

async function getXpLeaderboard({ guild }, author, settings) {
  if (!settings.stats.enabled) return "Ranking is disabled on this server";

  const lb = await getXpLb(guild.id, 10);
  if (lb.length === 0) return "No users in the leaderboard";

  let collector = "";
  for (let i = 0; i < lb.length; i++) {
    try {
      const user = await author.client.users.fetch(lb[i].member_id);
      collector += `**#${(i + 1).toString()}** - ${escapeInlineCode(user.tag)}\n`;
    } catch (ex) {
      // Ignore
    }
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: "XP Leaderboard" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(collector)
    .setFooter({ text: `Requested by ${author.tag}` });

  return { embeds: [embed] };
}

async function getInviteLeaderboard({ guild }, author, settings) {
  if (!settings.invite.tracking) return "Invite tracking is disabled on this server";

  const lb = await getInvitesLb(guild.id, 10);
  if (lb.length === 0) return "No users in the leaderboard";

  let collector = "";
  for (let i = 0; i < lb.length; i++) {
    try {
      const memberId = lb[i].member_id;
      if (memberId === "VANITY") collector += `**#${(i + 1).toString()}** - Vanity URL [${lb[i].invites}]\n`;
      else {
        const user = await author.client.users.fetch(lb[i].member_id);
        collector += `**#${(i + 1).toString()}** - ${escapeInlineCode(user.tag)} [${lb[i].invites}]\n`;
      }
    } catch (ex) {
      collector += `**#${(i + 1).toString()}** - DeletedUser#0000 [${lb[i].invites}]\n`;
    }
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Invite Leaderboard" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(collector)
    .setFooter({ text: `Requested by ${author.tag}` });

  return { embeds: [embed] };
}
