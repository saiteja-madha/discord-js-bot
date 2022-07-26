const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "autodelete",
  description: "manage the autodelete settings for the server",
  category: "AUTOMOD",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "attachments <on|off>",
        description: "allow or disallow attachments in message",
      },
      {
        trigger: "invites <on|off>",
        description: "allow or disallow invites in message",
      },
      {
        trigger: "links <on|off>",
        description: "allow or disallow links in message",
      },
      {
        trigger: "maxlines <number>",
        description: "sets maximum lines allowed per message [0 to disable]",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "attachments",
        description: "allow or disallow attachments in message",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "configuration status",
            required: true,
            type: ApplicationCommandOptionType.String,
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
        name: "invites",
        description: "allow or disallow discord invites in message",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "configuration status",
            required: true,
            type: ApplicationCommandOptionType.String,
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
        name: "links",
        description: "allow or disallow links in message",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "configuration status",
            required: true,
            type: ApplicationCommandOptionType.String,
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
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "configuration amount (0 to disable)",
            required: true,
            type: ApplicationCommandOptionType.Integer,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const settings = data.settings;
    const sub = args[0].toLowerCase();
    let response;

    if (sub == "attachments") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
      response = await antiAttachments(settings, status);
    }

    //
    else if (sub === "invites") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
      response = await antiInvites(settings, status);
    }

    //
    else if (sub == "links") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
      response = await antilinks(settings, status);
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
    else response = "Invalid command usage!";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;
    let response;

    if (sub == "attachments") {
      response = await antiAttachments(settings, interaction.options.getString("status"));
    } else if (sub === "invites") response = await antiInvites(settings, interaction.options.getString("status"));
    else if (sub == "links") response = await antilinks(settings, interaction.options.getString("status"));
    else if (sub === "maxlines") response = await maxLines(settings, interaction.options.getInteger("amount"));
    else response = "Invalid command usage!";

    await interaction.followUp(response);
  },
};

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
