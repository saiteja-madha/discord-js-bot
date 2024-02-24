const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const fetch = require("node-fetch");

module.exports = {
    name: "lyric",
    description: "Get lyrics for a song.",
    cooldown: 0,
    category: "MUSIC",
    botPermissions: ["EmbedLinks"],
    userPermissions: [],
    command: {
        enabled: true,
        aliases: [],
        usage: "<Song Title - singer>",
        minArgsCount: 0,
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "search",
                description: "The song name to search for lyrics.",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },

    async messageRun(message, args, data) {
        try {
            const value = args.join(" ");
            const response = await fetch(`https://weeb-api.vercel.app/genius?query=${encodeURIComponent(value)}`);
            const data = await response.json();
            const songData = data[0];

            const lyricsResponse = await fetch(`https://weeb-api.vercel.app/lyrics?url=${songData.url}`);
            const lyricsData = await lyricsResponse.json();

            const lyricEmbed = new EmbedBuilder()
                .setColor(EMBED_COLORS.BOT_EMBED)
                .setDescription(`${lyricsData.slice(0, 4096)}\n\n[Click for more](${songData.url})`)
                .setAuthor({
                    name: `${songData.title} by ${songData.artist} Lyrics`,
                    iconURL: message.author.displayAvatarURL({ size: 2048, dynamic: true }),
                })
                .setThumbnail(songData.image)
                .setFooter({
                    text: `Requested by ${message.author.username}`,
                })
                .setTimestamp();

            message.channel.send({ embeds: [lyricEmbed] });
        } catch (error) {
            message.safeReply("Oops! I can't find any lyrics for this song.");
        }
    },
    
    async interactionRun(interaction, data) {
        const value = interaction.options.getString("search");

        try {
            const response = await fetch(`https://weeb-api.vercel.app/genius?query=${value || ''}`);
            const data = await response.json();
            const songData = data[0];

            const lyricsResponse = await fetch(`https://weeb-api.vercel.app/lyrics?url=${songData.url}`);
            const lyricsData = await lyricsResponse.json();

            const lyricEmbed = new EmbedBuilder()
                .setColor(EMBED_COLORS.BOT_EMBED)
                .setDescription(`${lyricsData.slice(0, 4096)}\n\n[Click for more](${songData.url})`)
                .setAuthor({
                    name: `${songData.title} by ${songData.artist} Lyrics`,
                    iconURL: interaction.user.displayAvatarURL({ size: 2048, dynamic: true }),
                })
                .setThumbnail(songData.image)
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                })
                .setTimestamp();

            interaction.followUp({ embeds: [lyricEmbed] });
        } catch (error) {
            const lyricEmbed = new EmbedBuilder()
                .setColor(EMBED_COLORS.BOT_EMBED)
                .setDescription("Oops! I can't find any lyrics for this song.")
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                });

            interaction.followUp({ embeds: [lyricEmbed], ephemeral: true });
        }
    },
};
