const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { activatePremium } = require("@handlers/premium");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "givepremium",
  description: "Dá premium diretamente a um usuário",
  category: "OWNER",
  cooldown: 5,
  command: {
    enabled: true,
    usage: "<@usuário> [dias]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "usuario",
        description: "Usuário para receber premium",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "dias",
        description: "Duração em dias (padrão: 30)",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const user = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);
    const days = parseInt(args[1]) || 30;
    
    if (!user) {
      return message.safeReply("❌ Usuário não encontrado!");
    }
    
    try {
      await activatePremium(user, days);
      
      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("✅ Premium Concedido")
        .setDescription(`Premium de ${days} dias foi concedido para ${user.tag}`)
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();
      
      message.safeReply({ embeds: [embed] });
    } catch (error) {
      message.safeReply("❌ Erro ao conceder premium!");
    }
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("usuario");
    const days = interaction.options.getInteger("dias") || 30;
    
    try {
      await activatePremium(user, days);
      
      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("✅ Premium Concedido")
        .setDescription(`Premium de ${days} dias foi concedido para ${user.tag}`)
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();
      
      interaction.followUp({ embeds: [embed] });
    } catch (error) {
      interaction.followUp("❌ Erro ao conceder premium!");
    }
  },
};