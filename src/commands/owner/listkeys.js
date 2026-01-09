const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const VipKey = require("@schemas/VipKey");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "listkeys",
  description: "Lista chaves VIP geradas",
  category: "OWNER",
  cooldown: 5,
  command: {
    enabled: true,
    usage: "[página]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "pagina",
        description: "Página a exibir (padrão: 1)",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const page = parseInt(args[0]) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    try {
      const keys = await VipKey.find().sort({ created_at: -1 }).skip(skip).limit(limit);
      const total = await VipKey.countDocuments();
      const totalPages = Math.ceil(total / limit);
      
      if (keys.length === 0) {
        return message.safeReply("❌ Nenhuma chave VIP encontrada!");
      }
      
      const embed = new EmbedBuilder()
        .setColor("#068ADD")
        .setTitle("🎫 Chaves VIP")
        .setDescription(`Página ${page}/${totalPages} • Total: ${total} chaves`)
        .setTimestamp();
      
      keys.forEach(key => {
        const status = key.isUsed ? "✅ Usada" : "⏳ Disponível";
        const usedBy = key.isUsed ? `\nUsada por: <@${key.usedBy}>` : "";
        
        embed.addFields({
          name: `\`${key.code}\``,
          value: `${status} • ${key.duration} dias${usedBy}`,
          inline: true
        });
      });
      
      message.safeReply({ embeds: [embed] });
    } catch (error) {
      message.safeReply("❌ Erro ao listar chaves!");
    }
  },

  async interactionRun(interaction) {
    const page = interaction.options.getInteger("pagina") || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    try {
      const keys = await VipKey.find().sort({ created_at: -1 }).skip(skip).limit(limit);
      const total = await VipKey.countDocuments();
      const totalPages = Math.ceil(total / limit);
      
      if (keys.length === 0) {
        return interaction.followUp("❌ Nenhuma chave VIP encontrada!");
      }
      
      const embed = new EmbedBuilder()
        .setColor("#068ADD")
        .setTitle("🎫 Chaves VIP")
        .setDescription(`Página ${page}/${totalPages} • Total: ${total} chaves`)
        .setTimestamp();
      
      keys.forEach(key => {
        const status = key.isUsed ? "✅ Usada" : "⏳ Disponível";
        const usedBy = key.isUsed ? `\nUsada por: <@${key.usedBy}>` : "";
        
        embed.addFields({
          name: `\`${key.code}\``,
          value: `${status} • ${key.duration} dias${usedBy}`,
          inline: true
        });
      });
      
      interaction.followUp({ embeds: [embed] });
    } catch (error) {
      interaction.followUp("❌ Erro ao listar chaves!");
    }
  },
};