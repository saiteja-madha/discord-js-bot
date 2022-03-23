const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");

module.exports = class Automod extends Command {
  constructor(client) {
    super(client, {
      name: "automod",
      description: "various automod configuration",
      category: "AUTOMOD",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        minArgsCount: 2,
        subcommands: [
          {
            trigger: "antighostping <ON|OFF>",
            description: "Logs ghost mentions in your server",
          },
          {
            trigger: "antiinvites <ON|OFF>",
            description: "Allow or disallow sending discord invites in message",
          },
          {
            trigger: "antilinks <ON|OFF>",
            description: "Allow or disallow sending links in message",
          },
          {
            trigger: "antiscam <ON|OFF>",
            description: "Enable or disable antiscam detection",
          },
          {
            trigger: "maxlines <number>",
            description: "Sets maximum lines allowed per message [0 to disable]",
          },
          {
            trigger: "maxmentions <number>",
            description: "Sets maximum member mentions allowed per message [0 to disable]",
          },
          {
            trigger: "maxrolementions <number>",
            description: "Sets maximum role mentions allowed per message [0 to disable]",
          },
        ],
      },
      slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
          {
            name: "antighostping",
            description: "Logs ghost mentions in your server",
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
            description: "Allow or disallow sending discord invites in message",
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
            description: "Allow or disallow sending links in message",
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
            name: "antiscam",
            description: "Enable or disable antiscam detection",
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
            description: "Sets maximum lines allowed per message",
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
            name: "maxmentions",
            description: "Sets maximum user mentions allowed per message",
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
            name: "maxrolementions",
            description: "Sets maximum role mentions allowed per message",
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
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   * @param {object} data
   */
  async messageRun(message, args, data) {
    const settings = data.settings;
    const sub = args[0].toLowerCase();

    let response;
    if (sub == "antighostping") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
      response = await antighostPing(settings, status);
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
    else if (sub == "antiscam") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
      response = await antiScam(settings, status);
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
    else if (sub === "maxmentions") {
      const max = args[1];
      if (isNaN(max) || Number.parseInt(max) < 1) {
        return message.safeReply("Max Mentions must be a valid number greater than 0");
      }
      response = await maxMentions(settings, max);
    }

    //
    else if (sub === "maxrolementions") {
      const max = args[1];
      if (isNaN(max) || Number.parseInt(max) < 1) {
        return message.safeReply("Max Role Mentions must be a valid number greater than 0");
      }
      response = await maxRoleMentions(settings, max);
    }

    //
    else response = "Invalid command usage!";

    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {object} data
   */
  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;
    if (sub == "antighostping") response = await antighostPing(settings, interaction.options.getString("status"));
    else if (sub === "antiinvites") response = await antiInvites(settings, interaction.options.getString("status"));
    else if (sub == "antilinks") response = await antilinks(settings, interaction.options.getString("status"));
    else if (sub == "antiscam") response = await antiScam(settings, interaction.options.getString("status"));
    else if (sub === "maxlines") response = await maxLines(settings, interaction.options.getInteger("amount"));
    else if (sub === "maxmentions") response = await maxMentions(settings, interaction.options.getInteger("amount"));
    else if (sub === "maxrolementions") {
      response = await maxRoleMentions(settings, interaction.options.getInteger("amount"));
    }

    await interaction.followUp(response);
  }
};

async function antighostPing(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_ghostping = status;
  await settings.save();
  return `Configuration saved! Antighost ping is now ${status ? "enabled" : "disabled"}`;
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

async function antiScam(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_scam = status;
  await settings.save();
  return `Antiscam detection is now ${status ? "enabled" : "disabled"}`;
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

async function maxMentions(settings, input) {
  const mentions = Number.parseInt(input);
  if (isNaN(mentions)) return "Please enter a valid number input";

  settings.automod.max_mentions = mentions;
  await settings.save();
  return `${
    input === 0
      ? "Maximum user mentions limit is disabled"
      : `Messages having more than \`${input}\` user mentions will now be automatically deleted`
  }`;
}

async function maxRoleMentions(settings, input) {
  const mentions = Number.parseInt(input);
  if (isNaN(mentions)) return "Please enter a valid number input";

  settings.automod.max_role_mentions = mentions;
  await settings.save();
  return `${
    input === 0
      ? "Maximum role mentions limit is disabled"
      : `Messages having more than \`${input}\` role mentions will now be automatically deleted`
  }`;
}
