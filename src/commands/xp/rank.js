const { MessageAttachment } = require("discord.js");
const { EMBED_COLORS, IMAGE } = require("@root/config");
const { getBuffer } = require("@utils/httpUtils");
const { resolveMember } = require("@utils/guildUtils");
const { getMember, getXpLb } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "rank",
  description: "shows members rank in this server",
  cooldown: 5,
  category: "XP_SYSTEM",
  botPermissions: ["ATTACH_FILES"],
  command: {
    enabled: true,
    usage: "[@member|id]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "target user",
        type: "USER",
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const member = (await resolveMember(message, args[0])) || message.member;
    const response = await getRank(message, member, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(user);
    const response = await getRank(interaction, member, data.settings);
    await interaction.followUp(response);
  },
};

async function getRank({ guild }, member, settings) {
  const { user } = member;
  if (!settings.ranking.enabled) return "Ranking is disabled on this server";

  const memberDb = await getMember(guild.id, user.id);
  if (!memberDb.xp) return `${user.tag} is not ranked yet!`;

  const lb = await getXpLb(guild.id, 100);
  let pos = -1;
  lb.forEach((doc, i) => {
    if (doc.member_id == user.id) {
      pos = i + 1;
    }
  });

  const xpNeeded = memberDb.level * memberDb.level * 100;

  const url = new URL(`${IMAGE.BASE_API}/utils/rank-card`);
  url.searchParams.append("name", user.username);
  url.searchParams.append("discriminator", user.discriminator);
  url.searchParams.append("avatar", user.displayAvatarURL({ format: "png", size: 128 }));
  url.searchParams.append("currentxp", memberDb.xp);
  url.searchParams.append("reqxp", xpNeeded);
  url.searchParams.append("level", memberDb.level);
  url.searchParams.append("barcolor", EMBED_COLORS.BOT_EMBED);
  url.searchParams.append("status", member?.presence?.status?.toString() || "idle");
  if (pos !== -1) url.searchParams.append("rank", pos);

  const response = await getBuffer(url.href);
  if (!response.success) return "Failed to generate rank-card";

  const attachment = new MessageAttachment(response.buffer, "rank.png");
  return { files: [attachment] };
}
