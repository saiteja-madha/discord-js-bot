const { EmbedBuilder } = require("discord.js");
const { getSettings } = require("../database/schemas/Guild");

/**
 * 
 * @param {import("@structures/BotClient")} client 
 * @param {import("discord.js").User} oldUser 
 * @param {import("discord.js").User} newUser 
 */
module.exports = async (client, oldUser, newUser) => {
    if (newUser.bot) return;
    if (oldUser.partial) return;
    const guilds = client.guilds.cache.values();
    const commonGuilds = []
    for (const g of guilds) {
        // Check member
        const member = await g.members.fetch(newUser.id).catch(() => null)
        if (member) commonGuilds.push(g)
    }

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Member Updated" })
        .setColor("Green")
        .setThumbnail(newUser.displayAvatarURL())
        .setFooter({ text: `ID: ${newUser.id}` })
    // Avatar
    if (oldUser.avatar !== newUser.avatar) {
        embed
            .setTitle(`${newUser} (${newUser.username}) updated their avatar!`)
            .setImage(newUser.displayAvatarURL())
    }

    // User
    if (oldUser.username !== oldUser.username) {
        embed
            .setTitle(`${newUser} (${newUser.username}) updated their username!`)
            .setDescription(`\`${oldUser.username}\` -> \`${newUser.username}\``)
    }

    // Global name
    if (oldUser.globalName !== newUser.globalName) {
        embed.setTitle(`${newUser} (${newUser.username}) updated their global name!`)
            .setDescription(`\`${oldUser.globalName || "none"}\` -> \`${newUser.globalName || "none"}\``)
    }

    for (const g of commonGuilds) {
        const settings = await getSettings(g);
        if (!settings.logging?.members) continue
        const channel = client.channels.cache.get(settings.logging.members);
        if (!channel) continue;
        if (!embed.data.title) continue;
        channel.send({ embeds: [embed] })
    }
}