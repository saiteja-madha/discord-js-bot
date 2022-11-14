const { ApplicationCommandOptionType, SelectMenuBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, InteractionCollector } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "antiautomod",
  description: "Manage various automod settings for the server",
  category: "AUTOMOD",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "ghostping <on|off>",
        description: "detect and logs ghost mentions in your server",
      },
      {
        trigger: "spam <on|off>",
        description: "enable or disable antispam detection",
      },
      {
        trigger: "massmention <on|off> [threshold]",
        description: "enable or disable massmention detection [default threshold is 3 mentions]",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [],
  },

  async messageRun(message, args, data) {
    const settings = data.settings;
    const sub = args[0].toLowerCase();

    let response;
    if (sub == "ghostping") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
      response = await antiGhostPing(settings, status);
    }

    //
    else if (sub == "spam") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
      response = await antiSpam(settings, status);
    }

    //
    else if (sub === "massmention") {
      const status = args[1].toLowerCase();
      const threshold = args[2] || 3;
      if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
      response = await antiMassMention(settings, status, threshold);
    }

    //
    else response = "Invalid command usage!";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const settings = data.settings;
    let select = new SelectMenuBuilder()
    .setCustomId("select")
    .setPlaceholder("Select module")
    .setOptions({
      label: "Ghost ping",
      description: "Detects and logs ghost mentions in your server",
      value: "ghostping"
    }, {
      label: "Spam",
      description: "Enable or disable antispam detection",
      value: "spam"
    }, {
      label: "Mass mention",
      description: "Enable or disable massmention detection",
      value: "massmention"
    })
    let selectrow = new ActionRowBuilder().addComponents(select)
    let response = await interaction.editReply({components: [selectrow]})

    let collector = response.createMessageComponentCollector({type: 4})
    collector.on("collect", async i => {
      if(i.customId != "select") return;
      if(i.values[0] == "ghostping") ghostPing()
      if(i.values[0] == "spam") spam()
      if(i.values[0] == "massmention") massMention()
      i.deferUpdate()
    })

    let ghostcollector = response.createMessageComponentCollector({type: 3})
    ghostcollector.on("collect", async statusi => {
      if(statusi.customId != "status_ghostping") return;
      settings.automod.anti_ghostping = settings.automod.anti_ghostping ? false : true
      await settings.save()
      ghostPing()
      statusi.deferUpdate()
    })

    let spamcollector = response.createMessageComponentCollector({type: 3})
    spamcollector.on("collect", async statusi => {
      if(statusi.customId != "status_spam") return
      settings.automod.anti_spam = settings.automod.anti_spam ? false: true
      await settings.save()
      spam()
      statusi.deferUpdate()
    })

    let mentioncollector = response.createMessageComponentCollector({type: 3})
    mentioncollector.on("collect", async statusi => {
      if(statusi.customId == "status_massmention") {
        settings.automod.anti_massmention = settings.automod.anti_massmention ? 0 : 3
        await settings.save()
        massMention()
        statusi.deferUpdate()
      } else if(statusi.customId == "threshold") {
        let modal = new ModalBuilder()
        .setCustomId("modal" + statusi.id)
        .setTitle("Set threshold");
        let threshold = new TextInputBuilder()
        .setCustomId('threshold')
        .setLabel("Threshold")
        .setStyle("Short");
        let row = new ActionRowBuilder().addComponents(threshold);
        modal.addComponents(row);
        await statusi.showModal(modal);
        let collectorm = new InteractionCollector(interaction.client)
        collectorm.on("collect", async res => {
          if(res.customId != "modal" + statusi.id) return;
          if(isNaN(res.fields.getTextInputValue('threshold'))) return res.reply({ephemeral: true, content: "Not an number"})
          if(Number(res.fields.getTextInputValue('threshold')) < 1) return res.reply({ephemeral: true, content: "Insert a number higher than 1"})
          settings.automod.anti_massmention = Number(res.fields.getTextInputValue('threshold'))
          await settings.save()
          massMention()
          res.deferUpdate()
        })
      }
    })

    function ghostPing() {
      let embed = new EmbedBuilder()
      .setTitle("Ghost ping")
      .setFields({name: "Status", value: settings.automod.anti_ghostping ? "ON" : "OFF"})
      let button = new ButtonBuilder()
      .setCustomId("status_ghostping")
      .setLabel(settings.automod.anti_ghostping ? "Disable" : "Enable")
      .setStyle(settings.automod.anti_ghostping ? "Danger" : "Success")
      let buttonrow = new ActionRowBuilder().addComponents(button)
      interaction.editReply({components: [buttonrow, selectrow], embeds: [embed]})
    }
    
    function spam() {
      let embed = new EmbedBuilder()
        .setTitle("Spam")
        .setFields({name: "Status", value: settings.automod.anti_spam ? "ON" : "OFF"})
        let button = new ButtonBuilder()
        .setCustomId("status_spam")
        .setLabel(settings.automod.anti_spam ? "Disable" : "Enable")
        .setStyle(settings.automod.anti_spam ? "Danger" : "Success")
        let buttonrow = new ActionRowBuilder().addComponents(button)
        interaction.editReply({components: [buttonrow, selectrow], embeds: [embed]})
    }

    function massMention() {
      let embed = new EmbedBuilder()
        .setTitle("Mass mention")
        .setFields({name: "Status", value: settings.automod.anti_massmention ? "ON" : "OFF"})
        if(settings.automod.anti_massmention) embed.addFields({name: "Threshold", value: settings.automod.anti_massmention.toString()})
        let button = new ButtonBuilder()
        .setCustomId("status_massmention")
        .setLabel(settings.automod.anti_massmention ? "Disable" : "Enable")
        .setStyle(settings.automod.anti_massmention ? "Danger" : "Success")
        let button2 = new ButtonBuilder()
        .setCustomId("threshold")
        .setLabel("Set threshold")
        .setStyle("Primary")
        .setDisabled(settings.automod.anti_massmention ? false : true)
        let buttonrow = new ActionRowBuilder().addComponents(button, button2)
        interaction.editReply({components: [buttonrow, selectrow], embeds: [embed]})
    }
  },
};