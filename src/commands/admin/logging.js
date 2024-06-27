const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "logging",
    description: "enable or disable advance logs",
    category: "ADMIN",
    userPermissions: ["ManageGuild"],
    command: {
        enabled: true,
        subcommands: [
            {
                trigger: "channels <#channel|off>",
                description: "enable logging for channel updates",
            },
            {
                trigger: "members <#channel|off>",
                description: "enable logging for member updates",
            },
            {
                trigger: "voice <#channel|off>",
                description: "enable logging for voice channel updates",
            },
            {
                trigger: "invites <#channel|off>",
                description: "enable logging for invite creation and deletion",
            },
            {
                trigger: "messages <#channel|off>",
                description: "enable logging for message updates",
            },
            {
                trigger: "bans <#channel|off>",
                description: "enable logging for bans updates",
            },
        ],
        minArgsCount: 2,
    },
    slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
            {
                name: "channels",
                description: "enable logging for channel updates",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "channel",
                        description: "channel to send logs (leave empty to disable)",
                        type: ApplicationCommandOptionType.Channel,
                        required: false,
                        channelTypes: [ChannelType.GuildText],
                    },
                ],
            },
            {
                name: "members",
                description: "enable logging for members updates",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "channel",
                        description: "channel to send logs (leave empty to disable)",
                        type: ApplicationCommandOptionType.Channel,
                        required: false,
                        channelTypes: [ChannelType.GuildText],
                    },
                ],
            },
            {
                name: "voice",
                description: "enable logging for voice channel updates",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "channel",
                        description: "channel to send logs (leave empty to disable)",
                        type: ApplicationCommandOptionType.Channel,
                        required: false,
                        channelTypes: [ChannelType.GuildText],
                    },
                ],
            },
            {
                name: "invites",
                description: "enable logging for invites updates",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "channel",
                        description: "channel to send logs (leave empty to disable)",
                        type: ApplicationCommandOptionType.Channel,
                        required: false,
                        channelTypes: [ChannelType.GuildText],
                    },
                ],
            },
            {
                name: "messages",
                description: "enable logging for messages updates",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "channel",
                        description: "channel to send logs (leave empty to disable)",
                        type: ApplicationCommandOptionType.Channel,
                        required: false,
                        channelTypes: [ChannelType.GuildText],
                    },
                ],
            },
            {
                name: "bans",
                description: "enable logging for bans updates",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "channel",
                        description: "channel to send logs (leave empty to disable)",
                        type: ApplicationCommandOptionType.Channel,
                        required: false,
                        channelTypes: [ChannelType.GuildText],
                    },
                ],
            },
        ],
    },

    async messageRun(message, args, data) {
        const settings = data.settings;
        const sub = args[0].toLowerCase();
        const input = args[1].toLowerCase();
        let targetChannel;

        if (input === "none" || input === "off" || input === "disable") targetChannel = null;
        else {
            if (message.mentions.channels.size === 0) return message.safeReply("Incorrect command usage");
            targetChannel = message.mentions.channels.first();
        }

        const response = await setChannel(targetChannel, settings, sub);
        return message.safeReply(response);
    },

    async interactionRun(interaction, data) {
        const sub = interaction.options.getSubcommand();
        let channel = interaction.options.getChannel("channel");
        if (!channel) channel = null;
        const response = await setChannel(channel, data.settings, sub);
        return interaction.followUp(response);
    },
};

async function setChannel(targetChannel, settings, sub) {
    if (!targetChannel && !settings[sub]) {
        return "It is already disabled";
    }

    if (targetChannel && !targetChannel.canSendEmbeds()) {
        return "Ugh! I cannot send logs to that channel? I need the `Write Messages` and `Embed Links` permissions in that channel";
    }

    settings[sub] = targetChannel?.id;
    await settings.save();
    return `Configuration saved! **${parseSub(sub)} Updates** channel ${targetChannel ? `updated to ${targetChannel}` : "removed"}`;
}
/**
 * @param {string} sub 
 */
const parseSub = (sub) => {
    return sub.charAt(0).toUpperCase() + sub.slice(1);
}