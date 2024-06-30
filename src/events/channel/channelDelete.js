const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");
/**
 * @param {import('@src/structures').BotClient} client
 * @param {import("discord.js").GuildBasedChannel} channel
 */
module.exports = async (client, channel) => {
    const settings = await getSettings(channel.guild);
    if (!settings.logging.channels) return;
    const logChannel = client.channels.cache.get(settings.logging.channels);
    if (!logChannel) return;
    const auditLog = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
    const entry = auditLog.entries.first();
    const executor = entry.target.id === channel.id ? entry.executor : null;
    const channelType = require("@helpers/channelTypes")(channel.type);
    const embed = new EmbedBuilder()
        .setAuthor({ name: "Channel Deleted" })
        .setDescription(`Channel \`${channel.name}\` was Deleted`)
        .addFields({
            name: "Channel Type",
            value: channelType,
        }, {
            name: "Executor",
            value: executor ? executor.toString() : "Unknown",
        })
        .setTimestamp()
        .setColor("Red")
        .setFooter({ text: `ID: ${channel.id}` });
    logChannel.safeSend({ embeds: [embed] });
};
