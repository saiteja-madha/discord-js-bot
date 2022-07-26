const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require("discord.js");

const IDLE_TIMEOUT = 30; // in seconds
const MAX_PER_PAGE = 10; // max number of embed fields per page

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "listservers",
  description: "lists all/matching servers",
  category: "OWNER",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["listserver", "findserver", "findservers"],
    usage: "[match]",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args) {
    const { client, channel, member } = message;

    const matched = [];
    const match = args.join(" ") || null;
    if (match) {
      // match by id
      if (client.guilds.cache.has(match)) {
        matched.push(client.guilds.cache.get(match));
      }

      // match by name
      client.guilds.cache
        .filter((g) => g.name.toLowerCase().includes(match.toLowerCase()))
        .forEach((g) => matched.push(g));
    }

    const servers = match ? matched : Array.from(client.guilds.cache.values());
    const total = servers.length;
    const maxPerPage = MAX_PER_PAGE;
    const totalPages = Math.ceil(total / maxPerPage);

    if (totalPages === 0) return message.safeReply("No servers found");
    let currentPage = 1;

    // Buttons Row
    let components = [];
    components.push(
      new ButtonBuilder().setCustomId("prevBtn").setEmoji("⬅️").setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder()
        .setCustomId("nxtBtn")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(totalPages === 1)
    );
    let buttonsRow = new ActionRowBuilder().addComponents(components);

    // Embed Builder
    const buildEmbed = () => {
      const start = (currentPage - 1) * maxPerPage;
      const end = start + maxPerPage < total ? start + maxPerPage : total;

      const embed = new EmbedBuilder()
        .setColor(client.config.EMBED_COLORS.BOT_EMBED)
        .setAuthor({ name: "List of servers" })
        .setFooter({ text: `${match ? "Matched" : "Total"} Servers: ${total} • Page ${currentPage} of ${totalPages}` });

      const fields = [];
      for (let i = start; i < end; i++) {
        const server = servers[i];
        fields.push({
          name: server.name,
          value: server.id,
          inline: true,
        });
      }
      embed.addFields(fields);

      let components = [];
      components.push(
        ButtonBuilder.from(buttonsRow.components[0]).setDisabled(currentPage === 1),
        ButtonBuilder.from(buttonsRow.components[1]).setDisabled(currentPage === totalPages)
      );
      buttonsRow = new ActionRowBuilder().addComponents(components);
      return embed;
    };

    // Send Message
    const embed = buildEmbed();
    const sentMsg = await channel.send({ embeds: [embed], components: [buttonsRow] });

    // Listeners
    const collector = channel.createMessageComponentCollector({
      filter: (reaction) => reaction.user.id === member.id && reaction.message.id === sentMsg.id,
      idle: IDLE_TIMEOUT * 1000,
      dispose: true,
      componentType: ComponentType.Button,
    });

    collector.on("collect", async (response) => {
      if (!["prevBtn", "nxtBtn"].includes(response.customId)) return;
      await response.deferUpdate();

      switch (response.customId) {
        case "prevBtn":
          if (currentPage > 1) {
            currentPage--;
            const embed = buildEmbed();
            await sentMsg.edit({ embeds: [embed], components: [buttonsRow] });
          }
          break;

        case "nxtBtn":
          if (currentPage < totalPages) {
            currentPage++;
            const embed = buildEmbed();
            await sentMsg.edit({ embeds: [embed], components: [buttonsRow] });
          }
          break;
      }

      collector.on("end", async () => {
        await sentMsg.edit({ components: [] });
      });
    });
  },
};
