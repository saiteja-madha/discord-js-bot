const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
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
    let messagesDesc = "Deleted Messages\n\n";
    for (const m of messages.values()) {
        if (m.partial) continue;
        if (!m.content.length) continue
        messagesDesc += `Author: ${m.author.username}\nContent: ${m.content}\n--------------\n\n`;
    }
    const file = new AttachmentBuilder(Buffer.from(messagesDesc), {
        name: "deletedMessages.txt"
    });
    const logEmbed = new EmbedBuilder()
        .setAuthor({ name: "Bulk Message Deleted" })
        .setThumbnail()
        .setColor("Red")
        .setDescription(`### ${messages.size} Messages deleted in ${channel}`)
        .setTimestamp();


    await logChannel.safeSend({ embeds: [logEmbed] })
    await logChannel.safeSend({ files: [file] });

};
