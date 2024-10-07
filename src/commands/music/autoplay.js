const { musicValidations } = require("@helpers/BotUtils");
const { autoplayFunction } = require("@handlers/player");
const { EMBED_COLORS } = require("@root/config");
const { EmbedBuilder } = require("discord.js");

/**
 * @type {import("@structures/Command")}
  */
module.exports = {
    name: "autoplay",
    description: "Toggle autoplay feature for music player",
    category: "MUSIC",
    validations: musicValidations,
    command: {
        enabled: true,
        aliases: ["ap"],
        usage: "",
    },
    slashCommand: {
        enabled: true,
        options: [],
    },

    async messageRun(message, args) {
        const response = await toggleAutoplay(message);
        await message.safeReply(response);
    },

    async interactionRun(interaction) {
        const response = await toggleAutoplay(interaction);
        await interaction.followUp(response);
    },
};

async function toggleAutoplay({ client, guildId }) {
    const player = client.manager.getPlayer(guildId);

    if (!player || !player.queue.current) {
        return {
            embeds: [
                new EmbedBuilder().setColor(client.config.EMBED_COLORS.ERROR).setDescription("No song is currently playing"),
            ],
        };
    }

    const state = player.get("autoplay");
    player.set("autoplay", !state);

    if (state) {
        return {
            embeds: [new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Autoplay deactivated")],
        };
    }

    autoplayFunction(client, player.queue.current, player);
    return {
        embeds: [new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Autoplay activated!")],
    };
}