const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "premium",
  description: "Verifica seu status premium",
  category: "UTILITY",
  cooldown: 5,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message) {
    const userDb = await getUser(message.author);
    
    const embed = new EmbedBuilder()
      .setColor(userDb.premium.isActive ? "#gold" : "#red")
      .setTitle("💎 Status Premium")
      .setThumbnail(message.author.displayAvatarURL());
    
    if (userDb.premium.isActive) {
      const expiresAt = userDb.premium.expiresAt;
      const now = new Date();
      
      if (expiresAt && now > expiresAt) {
        userDb.premium.isActive = false;
        userDb.premium.expiresAt = null;
        await userDb.save();
        
        embed.setDescription("❌ Seu premium expirou!")
             .setColor("#red");
      } else {
        embed.setDescription("✅ Você tem premium ativo!")
             .addFields(
               { name: "Ativado em", value: `<t:${Math.floor(userDb.premium.activatedAt.getTime() / 1000)}:F>`, inline: true },
               { name: "Expira em", value: expiresAt ? `<t:${Math.floor(expiresAt.getTime() / 1000)}:F>` : "Nunca", inline: true }
             );
      }
    } else {
      embed.setDescription("❌ Você não tem premium ativo\n\nUse `/redeem <código>` para ativar uma chave VIP!");
    }
    
    message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const userDb = await getUser(interaction.user);
    
    const embed = new EmbedBuilder()
      .setColor(userDb.premium.isActive ? "#gold" : "#red")
      .setTitle("💎 Status Premium")
      .setThumbnail(interaction.user.displayAvatarURL());
    
    if (userDb.premium.isActive) {
      const expiresAt = userDb.premium.expiresAt;
      const now = new Date();
      
      if (expiresAt && now > expiresAt) {
        userDb.premium.isActive = false;
        userDb.premium.expiresAt = null;
        await userDb.save();
        
        embed.setDescription("❌ Seu premium expirou!")
             .setColor("#red");
      } else {
        embed.setDescription("✅ Você tem premium ativo!")
             .addFields(
               { name: "Ativado em", value: `<t:${Math.floor(userDb.premium.activatedAt.getTime() / 1000)}:F>`, inline: true },
               { name: "Expira em", value: expiresAt ? `<t:${Math.floor(expiresAt.getTime() / 1000)}:F>` : "Nunca", inline: true }
             );
      }
    } else {
      embed.setDescription("❌ Você não tem premium ativo\n\nUse `/redeem <código>` para ativar uma chave VIP!");
    }
    
    interaction.followUp({ embeds: [embed] });
  },
};