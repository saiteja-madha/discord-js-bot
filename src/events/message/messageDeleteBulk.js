const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client - The bot client instance
 * @param {import("discord.js").Collection<string, import('discord.js').Message | import('discord.js').PartialMessage>} messages - A collection of messages or partial
 * @param {import("discord.js").GuildTextBasedChannel} channel Channel where the action occured
*/
module.exports = async (client, messages, channel) => {
    const settings = await getSettings(channel.guild);

    if (!settings.logging?.messages) return
    const logChannel = client.channels.cache.get(settings.logging.messages);
    const auditLog = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.MessageBulkDelete, limit: 1 });
    const entry = auditLog.entries.first();
    const executor = entry.extra.channel.id === channel.id ? entry.executor : null;
    const logEmbed = new EmbedBuilder()
        .setAuthor({ name: "Bulk Message Deleted" })
        .setThumbnail()
        .setColor("Red")
        .setDescription(`${messages.size} Messages deleted in ${channel}`)
        .setFields({
            name: "Executor",
            value: executor ? executor.toString() : "Unknown",
        })
        .setTimestamp();


    logChannel.safeSend({ embeds: [logEmbed] })

};
