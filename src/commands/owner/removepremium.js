const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getUser } = require("@schemas/User");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "removepremium",
  description: "Remove premium de um usuário",
  category: "OWNER",
  cooldown: 5,
  command: {
    enabled: true,
    usage: "<@usuário>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "usuario",
        description: "Usuário para remover premium",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const user = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);
    
    if (!user) {
      return message.safeReply("❌ Usuário não encontrado!");
    }
    
    try {
      const userDb = await getUser(user);
      
      if (!userDb.premium.isActive) {
        return message.safeReply("❌ Este usuário não tem premium ativo!");
      }
      
      userDb.premium.isActive = false;
      userDb.premium.expiresAt = null;
      await userDb.save();
      
      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("❌ Premium Removido")
        .setDescription(`Premium foi removido de ${user.tag}`)
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();
      
      message.safeReply({ embeds: [embed] });
    } catch (error) {
      message.safeReply("❌ Erro ao remover premium!");
    }
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("usuario");
    
    try {
      const userDb = await getUser(user);
      
      if (!userDb.premium.isActive) {
        return interaction.followUp("❌ Este usuário não tem premium ativo!");
      }
      
      userDb.premium.isActive = false;
      userDb.premium.expiresAt = null;
      await userDb.save();
      
      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("❌ Premium Removido")
        .setDescription(`Premium foi removido de ${user.tag}`)
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();
      
      interaction.followUp({ embeds: [embed] });
    } catch (error) {
      interaction.followUp("❌ Erro ao remover premium!");
    }
  },
};