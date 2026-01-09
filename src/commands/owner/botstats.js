const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const VipKey = require("@schemas/VipKey");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "botstats",
  description: "Mostra estatísticas do bot",
  category: "OWNER",
  cooldown: 10,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message) {
    try {
      const client = message.client;
      
      // Estatísticas básicas
      const guilds = client.guilds.cache.size;
      const users = client.users.cache.size;
      const channels = client.channels.cache.size;
      
      // Estatísticas premium
      const totalKeys = await VipKey.countDocuments();
      const usedKeys = await VipKey.countDocuments({ isUsed: true });
      const availableKeys = totalKeys - usedKeys;
      
      // Uptime
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor(uptime / 3600) % 24;
      const minutes = Math.floor(uptime / 60) % 60;
      const seconds = Math.floor(uptime % 60);
      
      // Uso de memória
      const memUsage = process.memoryUsage();
      const memUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
      const memTotal = Math.round(memUsage.heapTotal / 1024 / 1024);
      
      const embed = new EmbedBuilder()
        .setColor("#068ADD")
        .setTitle("📊 Estatísticas do Bot")
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: "🏠 Servidores", value: guilds.toString(), inline: true },
          { name: "👥 Usuários", value: users.toString(), inline: true },
          { name: "📺 Canais", value: channels.toString(), inline: true },
          { name: "🎫 Chaves Totais", value: totalKeys.toString(), inline: true },
          { name: "✅ Chaves Usadas", value: usedKeys.toString(), inline: true },
          { name: "⏳ Chaves Disponíveis", value: availableKeys.toString(), inline: true },
          { name: "⏰ Uptime", value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
          { name: "💾 Memória", value: `${memUsed}MB / ${memTotal}MB`, inline: true },
          { name: "🏓 Ping", value: `${client.ws.ping}ms`, inline: true }
        )
        .setTimestamp();
      
      message.safeReply({ embeds: [embed] });
    } catch (error) {
      message.safeReply("❌ Erro ao obter estatísticas!");
    }
  },

  async interactionRun(interaction) {
    try {
      const client = interaction.client;
      
      // Estatísticas básicas
      const guilds = client.guilds.cache.size;
      const users = client.users.cache.size;
      const channels = client.channels.cache.size;
      
      // Estatísticas premium
      const totalKeys = await VipKey.countDocuments();
      const usedKeys = await VipKey.countDocuments({ isUsed: true });
      const availableKeys = totalKeys - usedKeys;
      
      // Uptime
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor(uptime / 3600) % 24;
      const minutes = Math.floor(uptime / 60) % 60;
      const seconds = Math.floor(uptime % 60);
      
      // Uso de memória
      const memUsage = process.memoryUsage();
      const memUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
      const memTotal = Math.round(memUsage.heapTotal / 1024 / 1024);
      
      const embed = new EmbedBuilder()
        .setColor("#068ADD")
        .setTitle("📊 Estatísticas do Bot")
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: "🏠 Servidores", value: guilds.toString(), inline: true },
          { name: "👥 Usuários", value: users.toString(), inline: true },
          { name: "📺 Canais", value: channels.toString(), inline: true },
          { name: "🎫 Chaves Totais", value: totalKeys.toString(), inline: true },
          { name: "✅ Chaves Usadas", value: usedKeys.toString(), inline: true },
          { name: "⏳ Chaves Disponíveis", value: availableKeys.toString(), inline: true },
          { name: "⏰ Uptime", value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
          { name: "💾 Memória", value: `${memUsed}MB / ${memTotal}MB`, inline: true },
          { name: "🏓 Ping", value: `${client.ws.ping}ms`, inline: true }
        )
        .setTimestamp();
      
      interaction.followUp({ embeds: [embed] });
    } catch (error) {
      interaction.followUp("❌ Erro ao obter estatísticas!");
    }
  },
};