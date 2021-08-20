const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { EMOJIS, EMBED_COLORS } = require("@root/config.js");
const moment = require("moment");

module.exports = class GuildInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: "guildinfo",
      description: "shows information about the discord server",
      aliases: ["serverinfo"],
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { guild } = ctx;
    const { name, id, preferredLocale, channels, roles, ownerId } = guild;

    let owner = await guild.members.fetch(ownerId);
    let createdAt = moment(guild.createdAt);

    let totalChannels = channels.cache.size;
    let categories = channels.cache.filter((c) => c.type === "category").size;
    let textChannels = channels.cache.filter((c) => c.type === "text").size;
    let voiceChannels = channels.cache.filter((c) => c.type === "voice").size;

    let memberCache = guild.members.cache;
    let all = memberCache.size;
    let bots = memberCache.filter((m) => m.user.bot).size;
    let users = all - bots;
    let onlineUsers = memberCache.filter((m) => !m.user.bot && m.presence?.status === "online").size;
    let onlineBots = memberCache.filter((m) => m.user.bot && m.presence?.status === "online").size;
    let onlineAll = onlineUsers + onlineBots;

    let rolesCount = roles.cache.size;
    let rolesString = roles.cache
      .filter((r) => !r.name.includes("everyone"))
      .map((r) => `${r.name}[${getMembersInRole(memberCache, r)}]`)
      .join(", ");

    let verificationLevel = guild.verificationLevel;
    switch (guild.verificationLevel) {
      case "VERY_HIGH":
        verificationLevel = "┻�?┻ミヽ(ಠ益ಠ)ノ彡┻�?┻";
        break;

      case "HIGH":
        verificationLevel = "(╯°□°）╯︵ ┻�?┻";
        break;

      default:
        break;
    }

    let desc = "";
    desc = desc + EMOJIS.ARROW + " **Id:** " + id + "\n";
    desc = desc + EMOJIS.ARROW + " **Name:** " + name + "\n";
    desc = desc + EMOJIS.ARROW + " **Owner:** " + owner.user.tag + "\n";
    desc = desc + EMOJIS.ARROW + " **Region:** " + preferredLocale + "\n";
    desc = desc + "\n";

    let embed = new MessageEmbed()
      .setTitle("GUILD INFORMATION")
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(desc)
      .addField(`Server Members [${all}]`, "```Members: " + users + "\nBots: " + bots + "```", true)
      .addField(`Online Stats [${onlineAll}]`, "```Members: " + onlineUsers + "\nBots: " + onlineBots + "```", true)
      .addField(
        `Categories and channels [${totalChannels}]`,
        "```Categories: " + categories + " | Text: " + textChannels + " | Voice: " + voiceChannels + "```",
        false
      )
      .addField(`Roles [${rolesCount}]`, "```" + rolesString + "```", false)
      .addField("Verification", "```" + verificationLevel + "```", true)
      .addField("Boost Count", "```" + guild.premiumSubscriptionCount + "```", true)
      .addField(
        `Server Created [${createdAt.fromNow()}]`,
        "```" + createdAt.format("dddd, Do MMMM YYYY") + "```",
        false
      );

    if (guild.splashURL) embed.setImage(guild.splashURL);

    ctx.reply({ embeds: [embed] });
  }
};

function getMembersInRole(members, role) {
  return members.filter((m) => m.roles.cache.has(role.id)).size;
}
