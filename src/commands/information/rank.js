const { Command } = require("@src/structures");
const { Message, MessageAttachment, CommandInteraction } = require("discord.js");
const { EMBED_COLORS, IMAGE } = require("@root/config");
const { getBuffer } = require("@utils/httpUtils");
const { getSettings } = require("@schemas/Guild");
const { resolveMember } = require("@utils/guildUtils");
const { getMember, getXpLb } = require("@schemas/Member");

module.exports = class Rank extends Command {
  constructor(client) {
    super(client, {
      name: "rank",
      description: "shows members rank in this server",
      cooldown: 5,
      category: "INFORMATION",
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
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const member = (await resolveMember(message, args[0])) || message.member;
    const response = await getRank(message, member);
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(user);
    const response = await getRank(interaction, member);
    await interaction.followUp(response);
  }
};

async function getRank({ guild }, member) {
  const { user } = member;

  const settings = await getSettings(guild);
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
