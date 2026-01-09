const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const VipKey = require("@schemas/VipKey");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "deletekey",
  description: "Deleta uma chave VIP específica",
  category: "OWNER",
  cooldown: 5,
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
        description: "Código da chave VIP para deletar",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const code = args[0].toUpperCase();
    
    try {
      const key = await VipKey.findOne({ code });
      
      if (!key) {
        return message.safeReply("❌ Chave VIP não encontrada!");
      }
      
      await VipKey.deleteOne({ code });
      
      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("🗑️ Chave Deletada")
        .setDescription(`Chave \`${code}\` foi deletada com sucesso!`)
        .addFields(
          { name: "Status", value: key.isUsed ? "Era usada" : "Era disponível", inline: true },
          { name: "Duração", value: `${key.duration} dias`, inline: true }
        )
        .setTimestamp();
      
      message.safeReply({ embeds: [embed] });
    } catch (error) {
      message.safeReply("❌ Erro ao deletar chave!");
    }
  },

  async interactionRun(interaction) {
    const code = interaction.options.getString("codigo").toUpperCase();
    
    try {
      const key = await VipKey.findOne({ code });
      
      if (!key) {
        return interaction.followUp("❌ Chave VIP não encontrada!");
      }
      
      await VipKey.deleteOne({ code });
      
      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("🗑️ Chave Deletada")
        .setDescription(`Chave \`${code}\` foi deletada com sucesso!`)
        .addFields(
          { name: "Status", value: key.isUsed ? "Era usada" : "Era disponível", inline: true },
          { name: "Duração", value: `${key.duration} dias`, inline: true }
        )
        .setTimestamp();
      
      interaction.followUp({ embeds: [embed] });
    } catch (error) {
      interaction.followUp("❌ Erro ao deletar chave!");
    }
  },
};