const { EmbedBuilder } = require("discord.js");
/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message|import('discord.js').PartialMessage} oldMessage
 * @param {import('discord.js').Message|import('discord.js').PartialMessage} newMessage
 */
module.exports = async (client, oldMessage, newMessage) => {
    if (oldMessage.partial) return;
    const { content } = oldMessage;
    const { author } = newMessage;
    const logChannel = client.channels.cache.get("1202855179377057822");
    if (newMessage.author.bot) return;
    if (newMessage.guild.id !== "852141490105090059") return;
    if (!logChannel) return;
    const logEmbed = new EmbedBuilder()
        .setAuthor({ name: "Message Edited" })
        .setThumbnail(author.displayAvatarURL())
        .setColor("#2c2d31")
        .setFields(
            { name: "Author", value: author.toString(), inline: true },
            {
                name: "Channel",
                value: oldMessage.channel.toString(),
                inline: true
            },
            {
                name: "Old Messgae",
                value: `${content}`
            },
            {
                name: "New Message",
                value: `${newMessage.content}`
            }
        )
        .setFooter({
            text: `By ${author.username} (${author.id})`,
            iconURL: author.avatarURL()
        })
        .setTimestamp();

    logChannel.safeSend({ embeds: [logEmbed] })
};



