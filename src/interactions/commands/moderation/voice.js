const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { addModAction } = require("@utils/modUtils");

module.exports = class VoiceCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "voice",
      description: "voice moderation commands",
      enabled: true,
      category: "MODERATION",
      userPermissions: ["MUTE_MEMBERS", "MOVE_MEMBERS", "DEAFEN_MEMBERS", "PRIORITY_SPEAKER"],
      botPermissions: ["MUTE_MEMBERS", "MOVE_MEMBERS", "DEAFEN_MEMBERS"],
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
          description: "unmute a member's voice",
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
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const sub = interaction.options.getSubcommand();
    const self = interaction.member;
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    let response;

    if (sub === "mute") response = await addModAction(self, target, reason, "VMUTE");
    else if (sub === "unmute") response = await addModAction(self, target, reason, "VUNMUTE");
    else if (sub === "deafen") response = await addModAction(self, target, reason, "DEAFEN");
    else if (sub === "undeafen") response = await addModAction(self, target, reason, "UNDEAFEN");
    else if (sub === "kick") response = await addModAction(self, target, reason, "DISCONNECT");
    // move
    else if (sub == "move") {
      const channel = interaction.options.getChannel("channel");
      response = await addModAction(self, target, reason, "MOVE", channel);
    }

    await interaction.followUp(response);
  }
};
