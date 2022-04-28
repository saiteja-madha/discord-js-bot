/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "automod",
  description: "various automod configuration",
  category: "AUTOMOD",
  userPermissions: ["MANAGE_GUILD"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "antighostping <on|off>",
        description: "detect and logs ghost mentions in your server",
      },
      {
        trigger: "antiattachments <on|off>",
        description: "allow or disallow attachments in messages",
      },
      {
        trigger: "antiinvites <on|off>",
        description: "allow or disallow discord invites in message",
      },
      {
        trigger: "antilinks <on|off>",
        description: "allow or disallow links in message",
      },
      {
        trigger: "antispam <on|off>",
        description: "enable or disable antispam detection",
      },
      {
        trigger: "maxlines <number>",
        description: "sets maximum lines allowed per message [0 to disable]",
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
    options: [
      {
        name: "antighostping",
        description: "detects and logs ghost mentions in your server",
        type: "SUB_COMMAND",
        options: [
          {
            name: "status",
            description: "configuration status",
            required: true,
            type: "STRING",
            choices: [
              {
                name: "ON",
                value: "ON",
              },
              {
                name: "OFF",
                value: "OFF",
              },
            ],
          },
        ],
      },
      {
        name: "antiattachments",
        description: "allow or disallow attachments in message",
        type: "SUB_COMMAND",
        options: [
          {
            name: "status",
            description: "configuration status",
            required: true,
            type: "STRING",
            choices: [
              {
                name: "ON",
                value: "ON",
              },
              {
                name: "OFF",
                value: "OFF",
              },
            ],
          },
        ],
      },
      {
        name: "antiinvites",
        description: "allow or disallow discord invites in message",
        type: "SUB_COMMAND",
        options: [
          {
            name: "status",
            description: "configuration status",
            required: true,
            type: "STRING",
            choices: [
              {
                name: "ON",
                value: "ON",
              },
              {
                name: "OFF",
                value: "OFF",
              },
            ],
          },
        ],
      },
      {
        name: "antilinks",
        description: "allow or disallow links in message",
        type: "SUB_COMMAND",
        options: [
          {
            name: "status",
            description: "configuration status",
            required: true,
            type: "STRING",
            choices: [
              {
                name: "ON",
                value: "ON",
              },
              {
                name: "OFF",
                value: "OFF",
              },
            ],
          },
        ],
      },
      {
        name: "antispam",
        description: "enable or disable antispam detection",
        type: "SUB_COMMAND",
        options: [
          {
            name: "status",
            description: "configuration status",
            required: true,
            type: "STRING",
            choices: [
              {
                name: "ON",
                value: "ON",
              },
              {
                name: "OFF",
                value: "OFF",
              },
            ],
          },
        ],
      },
      {
        name: "maxlines",
        description: "sets maximum lines allowed per message",
        type: "SUB_COMMAND",
        options: [
          {
            name: "amount",
            description: "configuration amount (0 to disable)",
            required: true,
            type: "INTEGER",
          },
        ],
      },
      {
        name: "massmention",
        description: "enable or disable massmention detection",
        type: "SUB_COMMAND",
        options: [
          {
            name: "status",
            description: "configuration status",
            required: true,
            type: "STRING",
            choices: [
              {
                name: "ON",
                value: "ON",
              },
              {
                name: "OFF",
                value: "OFF",
              },
            ],
          },
          {
            name: "threshold",
            description: "configuration threshold (default is 3 mentions)",
            required: false,
            type: "INTEGER",
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const settings = data.settings;
    const sub = args[0].toLowerCase();

    let response;
    if (sub == "antighostping") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
      response = await antiGhostPing(settings, status);
    }

    //
    if (sub == "antiattachments") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
      response = await antiAttachments(settings, status);
    }

    //
    else if (sub === "antiinvites") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
      response = await antiInvites(settings, status);
    }

    //
    else if (sub == "antilinks") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
      response = await antilinks(settings, status);
    }

    //
    else if (sub == "antispam") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
      response = await antiSpam(settings, status);
    }

    //
    else if (sub === "maxlines") {
      const max = args[1];
      if (isNaN(max) || Number.parseInt(max) < 1) {
        return message.safeReply("Max Lines must be a valid number greater than 0");
      }
      response = await maxLines(settings, max);
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
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;
    if (sub == "antighostping") response = await antiGhostPing(settings, interaction.options.getString("status"));
    else if (sub == "antiattachments") {
      response = await antiAttachments(settings, interaction.options.getString("status"));
    } else if (sub === "antiinvites") response = await antiInvites(settings, interaction.options.getString("status"));
    else if (sub == "antilinks") response = await antilinks(settings, interaction.options.getString("status"));
    else if (sub == "antispam") response = await antiSpam(settings, interaction.options.getString("status"));
    else if (sub === "maxlines") response = await maxLines(settings, interaction.options.getInteger("amount"));
    else if (sub === "massmention") {
      response = await antiMassMention(settings, interaction.options.getInteger("amount"));
    } else response = "Invalid command usage!";

    await interaction.followUp(response);
  },
};

async function antiGhostPing(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_ghostping = status;
  await settings.save();
  return `Configuration saved! Anti-Ghostping is now ${status ? "enabled" : "disabled"}`;
}

async function antiAttachments(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_attachments = status;
  await settings.save();
  return `Messages ${
    status ? "with attachments will now be automatically deleted" : "will not be filtered for attachments now"
  }`;
}

async function antiInvites(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_invites = status;
  await settings.save();
  return `Messages ${
    status ? "with discord invites will now be automatically deleted" : "will not be filtered for discord invites now"
  }`;
}

async function antilinks(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_links = status;
  await settings.save();
  return `Messages ${status ? "with links will now be automatically deleted" : "will not be filtered for links now"}`;
}

async function antiSpam(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_spam = status;
  await settings.save();
  return `Antispam detection is now ${status ? "enabled" : "disabled"}`;
}

async function maxLines(settings, input) {
  const lines = Number.parseInt(input);
  if (isNaN(lines)) return "Please enter a valid number input";

  settings.automod.max_lines = lines;
  await settings.save();
  return `${
    input === 0
      ? "Maximum line limit is disabled"
      : `Messages longer than \`${input}\` lines will now be automatically deleted`
  }`;
}

async function antiMassMention(settings, input, threshold) {
  const status = input.toUpperCase() === "ON" ? true : false;
  if (!status) {
    settings.automod.anti_massmention = 0;
  } else {
    settings.automod.anti_massmention = threshold;
  }
  await settings.save();
  return `Mass mention detection is now ${status ? "enabled" : "disabled"}`;
}
