const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");

module.exports = class Play extends Command {
    constructor(client) {
        super(client, {
            name: "seek",
            description: "Seeks to the given time in seconds",
            command: {
                enabled: true,
                category: "MUSIC",
            },
            slashCommand: {
                enabled: false,
            },
        });
    }

    /**
     * @param {Message} message
     * @param {string[]} args
     */
    async messageRun(message, args) {
        const queue = message.client.player.getQueue(message.guildId);
        if (!queue || !queue.playing) return message.channel.send("No music is being played!");
        if (isNaN(args[0])) return message.channel.send("Input must be in seconds");

        const time = args[0] * 1000;
        await queue.seek(time);

        const embed = new MessageEmbed()
            .setDescription("⏩ | Seeked to " + time / 1000 + " seconds")
        return message.channel.send({ embeds: [embed] });
    }
};