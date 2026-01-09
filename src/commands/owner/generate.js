const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const VipKey = require("@schemas/VipKey");
const { timeformat } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "generate",
  description: "Gera chaves VIP com opções avançadas",
  category: "OWNER",
  cooldown: 3,
  command: {
    enabled: true,
    usage: "[dias] [quantidade] [tipo]",
    minArgsCount: 0,
    subcommands: [
      {
        trigger: "single [dias]",
        description: "gera uma chave única",
      },
      {
        trigger: "bulk <quantidade> [dias]",
        description: "gera múltiplas chaves",
      },
      {
        trigger: "custom <dias> [prefixo]",
        description: "gera chave personalizada",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "single",
        description: "Gera uma chave VIP única",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "dias",
            description: "Duração em dias (padrão: 30)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            min_value: 1,
            max_value: 365,
          },
        ],
      },
      {
        name: "bulk",
        description: "Gera múltiplas chaves VIP",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "quantidade",
            description: "Número de chaves a gerar",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            min_value: 1,
            max_value: 10,
          },
          {
            name: "dias",
            description: "Duração em dias (padrão: 30)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            min_value: 1,
            max_value: 365,
          },
        ],
      },
      {
        name: "custom",
        description: "Gera chave personalizada",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "dias",
            description: "Duração em dias",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            min_value: 1,
            max_value: 365,
          },
          {
            name: "prefixo",
            description: "Prefixo personalizado (máx 4 chars)",
            type: ApplicationCommandOptionType.String,
            required: false,
            max_length: 4,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0]?.toLowerCase();
    
    if (sub === "bulk") {
      const quantity = parseInt(args[1]) || 1;
      const days = parseInt(args[2]) || 30;
      return await this.generateBulk(message, quantity, days);
    }
    
    if (sub === "custom") {
      const days = parseInt(args[1]) || 30;
      const prefix = args[2]?.toUpperCase().slice(0, 4);
      return await this.generateCustom(message, days, prefix);
    }
    
    // Default single generation
    const days = parseInt(args[0]) || 30;
    await this.generateSingle(message, days);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    
    if (sub === "bulk") {
      const quantity = interaction.options.getInteger("quantidade");
      const days = interaction.options.getInteger("dias") || 30;
      return await this.generateBulk(interaction, quantity, days);
    }
    
    if (sub === "custom") {
      const days = interaction.options.getInteger("dias");
      const prefix = interaction.options.getString("prefixo")?.toUpperCase();
      return await this.generateCustom(interaction, days, prefix);
    }
    
    // Default single
    const days = interaction.options.getInteger("dias") || 30;
    await this.generateSingle(interaction, days);
  },

  async generateSingle(ctx, days) {
    const code = generateVipCode();
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    try {
      await VipKey.create({ code, duration: days, expiresAt });
      
      const embed = new EmbedBuilder()
        .setColor("#FFD700")
        .setTitle("⭐ Chave VIP Gerada")
        .addFields(
          { name: "🎫 Código", value: `\`${code}\``, inline: true },
          { name: "⏰ Duração", value: `${days} dias`, inline: true },
          { name: "📅 Expira em", value: timeformat(expiresAt), inline: false }
        )
        .setFooter({ text: "Use /redeem para ativar" })
        .setTimestamp();
      
      const reply = ctx.safeReply || ctx.followUp;
      await reply({ embeds: [embed] });
    } catch (error) {
      const reply = ctx.safeReply || ctx.followUp;
      await reply("❌ Erro ao gerar chave VIP!");
    }
  },

  async generateBulk(ctx, quantity, days) {
    if (quantity > 10) quantity = 10;
    
    const codes = [];
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    try {
      for (let i = 0; i < quantity; i++) {
        const code = generateVipCode();
        await VipKey.create({ code, duration: days, expiresAt });
        codes.push(code);
      }
      
      const embed = new EmbedBuilder()
        .setColor("#FFD700")
        .setTitle(`⭐ ${quantity} Chaves VIP Geradas`)
        .setDescription(`\`\`\`\n${codes.join('\n')}\`\`\``)
        .addFields(
          { name: "⏰ Duração", value: `${days} dias cada`, inline: true },
          { name: "📅 Expiram em", value: timeformat(expiresAt), inline: true }
        )
        .setFooter({ text: "Use /redeem para ativar" })
        .setTimestamp();
      
      const reply = ctx.safeReply || ctx.followUp;
      await reply({ embeds: [embed] });
    } catch (error) {
      const reply = ctx.safeReply || ctx.followUp;
      await reply("❌ Erro ao gerar chaves VIP!");
    }
  },

  async generateCustom(ctx, days, prefix) {
    const code = generateVipCode(prefix);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    try {
      await VipKey.create({ code, duration: days, expiresAt, isCustom: true });
      
      const embed = new EmbedBuilder()
        .setColor("#9932CC")
        .setTitle("💎 Chave VIP Personalizada")
        .addFields(
          { name: "🎫 Código", value: `\`${code}\``, inline: true },
          { name: "⏰ Duração", value: `${days} dias`, inline: true },
          { name: "📅 Expira em", value: timeformat(expiresAt), inline: false }
        )
        .setFooter({ text: "Chave personalizada • Use /redeem para ativar" })
        .setTimestamp();
      
      const reply = ctx.safeReply || ctx.followUp;
      await reply({ embeds: [embed] });
    } catch (error) {
      const reply = ctx.safeReply || ctx.followUp;
      await reply("❌ Erro ao gerar chave personalizada!");
    }
  },
};

function generateVipCode(prefix = null) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = prefix || "";
  const remaining = 16 - result.length;
  
  for (let i = 0; i < remaining; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result.match(/.{1,4}/g).join("-");
}