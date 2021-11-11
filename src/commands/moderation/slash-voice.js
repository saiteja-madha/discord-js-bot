const { Command } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const deafen = require("./shared/deafen");
const vmute = require("./shared/vmute");
const vunmute = require("./shared/vunmute");
const undeafen = require("./shared/undeafen");
const disconnect = require("./shared/disconnect");
const move = require("./shared/move");

// SLASH COMMAND ONLY

module.exports = class VoiceCommand extends Command {
  constructor(client) {
    super(client, {
      name: "voice",
      description: "voice moderation commands",
      category: "MODERATION",
      userPermissions: ["MUTE_MEMBERS", "MOVE_MEMBERS", "DEAFEN_MEMBERS"],
      botPermissions: ["MUTE_MEMBERS", "MOVE_MEMBERS", "DEAFEN_MEMBERS"],
      command: {
        enabled: false,
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "mute",
            description: "mute a member's voice",
            type: "SUB_COMMAND",
            options: [
              {
                name: "user",
                description: "the target member",
                type: "USER",
                required: true,
              },
              {
                name: "reason",
                description: "reason for mute",
                type: "STRING",
                required: false,
              },
            ],
          },
          {
            name: "unmute",
            description: "unmute a muted member's voice",
            type: "SUB_COMMAND",
            options: [
              {
                name: "user",
                description: "the target member",
                type: "USER",
                required: true,
              },
              {
                name: "reason",
                description: "reason for unmute",
                type: "STRING",
                required: false,
              },
            ],
          },
          {
            name: "deafen",
            description: "deafen a member in voice channel",
            type: "SUB_COMMAND",
            options: [
              {
                name: "user",
                description: "the target member",
                type: "USER",
                required: true,
              },
              {
                name: "reason",
                description: "reason for deafen",
                type: "STRING",
                required: false,
              },
            ],
          },
          {
            name: "undeafen",
            description: "undeafen a member in voice channel",
            type: "SUB_COMMAND",
            options: [
              {
                name: "user",
                description: "the target member",
                type: "USER",
                required: true,
              },
              {
                name: "reason",
                description: "reason for undeafen",
                type: "STRING",
                required: false,
              },
            ],
          },
          {
            name: "kick",
            description: "kick a member from voice channel",
            type: "SUB_COMMAND",
            options: [
              {
                name: "user",
                description: "the target member",
                type: "USER",
                required: true,
              },
              {
                name: "reason",
                description: "reason for mute",
                type: "STRING",
                required: false,
              },
            ],
          },
          {
            name: "move",
            description: "move a member from one voice channel to another",
            type: "SUB_COMMAND",
            options: [
              {
                name: "user",
                description: "the target member",
                type: "USER",
                required: true,
              },
              {
                name: "channel",
                description: "the channel to move member to",
                type: "CHANNEL",
                channelTypes: ["GUILD_VOICE", "GUILD_STAGE_VOICE"],
                required: true,
              },
              {
                name: "reason",
                description: "reason for mute",
                type: "STRING",
                required: false,
              },
            ],
          },
        ],
      },
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    const reason = interaction.options.getString("reason");

    const user = interaction.options.getUser("user");
    const target = await interaction.guild.members.fetch(user.id);

    let response;

    if (sub === "mute") response = await vmute(interaction, target, reason);
    else if (sub === "unmute") response = await vunmute(interaction, target, reason);
    else if (sub === "deafen") response = await deafen(interaction, target, reason);
    else if (sub === "undeafen") response = await undeafen(interaction, target, reason);
    else if (sub === "kick") response = await disconnect(interaction, target, reason);
    else if (sub == "move") {
      const channel = interaction.options.getChannel("channel");
      response = await move(interaction, target, reason, channel);
    }

    await interaction.followUp(response);
  }
};
