/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "leaveserver",
  description: "leave a server.",
  category: "OWNER",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    usage: "<serverId>",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args, data) {
    const input = args[0];
    const guild = message.client.guilds.cache.get(input);
    if (!guild) {
      return message.safeReply(
        `No server found. Please provide a valid server id.
        You may use ${data.prefix}findserver/${data.prefix}listservers to find the server id`
      );
    }

    const name = guild.name;
    try {
      await guild.leave();
      return message.safeReply(`Successfully Left \`${name}\``);
    } catch (err) {
      message.client.logger.error("GuildLeave", err);
      return message.safeReply(`Failed to leave \`${name}\``);
    }
  },
};
