const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const VipKey = require("@schemas/VipKey");
const { activatePremium } = require("@handlers/premium");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "redeem",
  description: "Resgata uma chave VIP",
  category: "UTILITY",
  cooldown: 10,
  command: {
    enabled: true,
    usage: "<código>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "codigo",
        description: "Código da chave VIP",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const code = args[0].toUpperCase();
    
    try {
      const vipKey = await VipKey.findOne({ code });
      
      if (!vipKey) {
        return message.safeReply("❌ Chave VIP inválida!");
      }
      
      if (vipKey.isUsed) {
        return message.safeReply("❌ Esta chave já foi utilizada!");
      }
      
      // Ativar premium
      await activatePremium(message.author, vipKey.duration);
      
      // Marcar chave como usada
      vipKey.isUsed = true;
      vipKey.usedBy = message.author.id;
      vipKey.usedAt = new Date();
      await vipKey.save();
      
      const embed = new EmbedBuilder()
        .setColor("#gold")
        .setTitle("🎉 Premium Ativado!")
        .setDescription(`Parabéns! Você ativou ${vipKey.duration} dias de premium!`)
        .addFields(
          { name: "Duração", value: `${vipKey.duration} dias`, inline: true },
          { name: "Expira em", value: `<t:${Math.floor((Date.now() + (vipKey.duration * 24 * 60 * 60 * 1000)) / 1000)}:F>`, inline: true }
        )
        .setTimestamp();
      
      message.safeReply({ embeds: [embed] });
    } catch (error) {
      message.safeReply("❌ Erro ao resgatar chave VIP!");
    }
  },

  async interactionRun(interaction) {
    const code = interaction.options.getString("codigo").toUpperCase();
    
    try {
      const vipKey = await VipKey.findOne({ code });
      
      if (!vipKey) {
        return interaction.followUp("❌ Chave VIP inválida!");
      }
      
      if (vipKey.isUsed) {
        return interaction.followUp("❌ Esta chave já foi utilizada!");
      }
      
      // Ativar premium
      await activatePremium(interaction.user, vipKey.duration);
      
      // Marcar chave como usada
      vipKey.isUsed = true;
      vipKey.usedBy = interaction.user.id;
      vipKey.usedAt = new Date();
      await vipKey.save();
      
      const embed = new EmbedBuilder()
        .setColor("#gold")
        .setTitle("🎉 Premium Ativado!")
        .setDescription(`Parabéns! Você ativou ${vipKey.duration} dias de premium!`)
        .addFields(
          { name: "Duração", value: `${vipKey.duration} dias`, inline: true },
          { name: "Expira em", value: `<t:${Math.floor((Date.now() + (vipKey.duration * 24 * 60 * 60 * 1000)) / 1000)}:F>`, inline: true }
        )
        .setTimestamp();
      
      interaction.followUp({ embeds: [embed] });
    } catch (error) {
      interaction.followUp("❌ Erro ao resgatar chave VIP!");
    }
  },
};