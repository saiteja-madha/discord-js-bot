const { Command } = require("@src/structures");
const { Message, CommandInteraction, MessageEmbed } = require("discord.js");
const { parsePermissions } = require("@utils/botUtils");
const { EMBED_COLORS } = require("@root/config");

// Sub Commands
const start = require("./sub/start");
const pause = require("./sub/pause");
const resume = require("./sub/resume");
const end = require("./sub/end");
const reroll = require("./sub/reroll");
const list = require("./sub/list");
const edit = require("./sub/edit");

module.exports = class Giveaway extends Command {
  constructor(client) {
    super(client, {
      name: "giveaway",
      description: "giveaway commands",
      category: "GIVEAWAY",
      command: {
        enabled: true,
        minArgsCount: 1,
        subcommands: [
          {
            trigger: "start",
            description: "start an interactive giveaway setup",
          },
          {
            trigger: "pause <messageId>",
            description: "pause a giveaway",
          },
          {
            trigger: "resume <messageId>",
            description: "resume a paused giveaway",
          },
          {
            trigger: "end <messageId>",
            description: "end a giveaway",
          },
          {
            trigger: "reroll <messageId>",
            description: "reroll a giveaway",
          },
          {
            trigger: "list",
            description: "list all giveaways",
          },
          {
            trigger: "edit",
            description: "edit a giveaway",
          },
        ],
      },
      slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
          {
            name: "start",
            description: "start a giveaway",
            type: "SUB_COMMAND",
            options: [
              {
                name: "channel",
                description: "the channel to start the giveaway in",
                type: "CHANNEL",
                channelTypes: ["GUILD_TEXT"],
                required: true,
              },
              {
                name: "duration",
                description: "the duration of the giveaway in minutes",
                type: "INTEGER",
                required: true,
              },
              {
                name: "prize",
                description: "the prize of the giveaway",
                type: "STRING",
                required: true,
              },
              {
                name: "winners",
                description: "the number of winners",
                type: "INTEGER",
                required: true,
              },
              {
                name: "host",
                description: "the host of the giveaway",
                type: "USER",
                required: false,
              },
            ],
          },
          {
            name: "pause",
            description: "pause a giveaway",
            type: "SUB_COMMAND",
            options: [
              {
                name: "message_id",
                description: "the message id of the giveaway",
                type: "STRING",
                required: true,
              },
            ],
          },
          {
            name: "resume",
            description: "resume a paused giveaway",
            type: "SUB_COMMAND",
            options: [
              {
                name: "message_id",
                description: "the message id of the giveaway",
                type: "STRING",
                required: true,
              },
            ],
          },
          {
            name: "end",
            description: "end a giveaway",
            type: "SUB_COMMAND",
            options: [
              {
                name: "message_id",
                description: "the message id of the giveaway",
                type: "STRING",
                required: true,
              },
            ],
          },
          {
            name: "reroll",
            description: "reroll a giveaway",
            type: "SUB_COMMAND",
            options: [
              {
                name: "message_id",
                description: "the message id of the giveaway",
                type: "STRING",
                required: true,
              },
            ],
          },
          {
            name: "list",
            description: "list all giveaways",
            type: "SUB_COMMAND",
          },
          {
            name: "edit",
            description: "edit a giveaway",
            type: "SUB_COMMAND",
            options: [
              {
                name: "message_id",
                description: "the message id of the giveaway",
                type: "STRING",
                required: true,
              },
              {
                name: "add_duration",
                description: "the number of minutes to add to the giveaway duration",
                type: "INTEGER",
                required: false,
              },
              {
                name: "new_prize",
                description: "the new prize",
                type: "STRING",
                required: false,
              },
              {
                name: "new_winners",
                description: "the new number of winners",
                type: "INTEGER",
                required: false,
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
   */
  async messageRun(message, args) {
    const sub = args[0]?.toLowerCase();
    let response;

    //
    if (sub === "start") {
      if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) {
        return message.safeReply("I am missing `Embed Links` permission to run an interactive setup");
      }
      return await runInteractiveSetup(message);
    }

    //
    else if (sub === "pause") {
      const messageId = args[1];
      response = await pause(message.member, messageId);
    }

    //
    else if (sub === "resume") {
      const messageId = args[1];
      response = await resume(message.member, messageId);
    }

    //
    else if (sub === "end") {
      const messageId = args[1];
      response = await end(message.member, messageId);
    }

    //
    else if (sub === "reroll") {
      const messageId = args[1];
      response = await reroll(message.member, messageId);
    }

    //
    else if (sub === "list") {
      response = await list(message.member);
    }

    //
    else if (sub === "edit") {
      return await runInteractiveEdit(message);
    }

    //
    else response = "Not a valid sub command";

    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response;

    //
    if (sub === "start") {
      const channel = interaction.options.getChannel("channel");
      const duration = interaction.options.getInteger("duration");
      const prize = interaction.options.getString("prize");
      const winnerCount = interaction.options.getInteger("winners");
      const host = interaction.options.getUser("host");
      response = await start(interaction.member, channel, duration, prize, winnerCount, host);
    }

    //
    else if (sub === "pause") {
      const messageId = interaction.options.getString("message_id");
      response = await pause(interaction.member, messageId);
    }

    //
    else if (sub === "resume") {
      const messageId = interaction.options.getString("message_id");
      response = await resume(interaction.member, messageId);
    }

    //
    else if (sub === "end") {
      const messageId = interaction.options.getString("message_id");
      response = await end(interaction.member, messageId);
    }

    //
    else if (sub === "reroll") {
      const messageId = interaction.options.getString("message_id");
      response = await reroll(interaction.member, messageId);
    }

    //
    else if (sub === "list") {
      response = await list(interaction.member);
    }

    //
    else if (sub === "edit") {
      const messageId = interaction.options.getString("message_id");
      const addDuration = interaction.options.getInteger("add_duration");
      const newPrize = interaction.options.getString("new_prize");
      const newWinnerCount = interaction.options.getInteger("new_winners");
      response = await edit(interaction.member, messageId, addDuration, newPrize, newWinnerCount);
    }

    //
    else response = "Invalid subcommand";

    await interaction.followUp(response);
  }
};

// Interactive Giveaway setup
async function runInteractiveSetup(message) {
  const { member, channel, guild } = message;

  const SETUP_TIMEOUT = 30 * 1000;
  const SETUP_PERMS = ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"];

  const filter = (m) => m.author.id === member.id;
  const embed = new MessageEmbed()
    .setAuthor({ name: "Giveaway Setup" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setFooter({ text: "Type cancel to cancel setup" });

  let targetChannel;
  let duration;
  let prize;
  let winners = 1;
  let host;

  const waitFor = async (question) => {
    await channel.send({ embeds: [embed.setDescription(question)] });
    try {
      let reply = (await channel.awaitMessages({ filter, max: 1, time: SETUP_TIMEOUT, errors: ["time"] })).first();
      if (reply.content.toLowerCase() === "cancel") {
        await reply.reply("Giveaway setup has been cancelled");
        return false;
      }

      return reply;
    } catch (err) {
      await channel.send({ embeds: [embed.setDescription("No response received. Giveaway setup has been cancelled")] });
      return false;
    }
  };

  let reply;
  try {
    // wait for channel
    reply = await waitFor("Please `mention the channel` in which the giveaway must be hosted");
    if (reply === false) return;
    targetChannel = reply.mentions.channels.first();
    if (!targetChannel) return reply.reply("Giveaway setup has been cancelled. You did not mention a channel");
    if (!targetChannel.isText() && !targetChannel.permissionsFor(guild.me).has(SETUP_PERMS)) {
      return reply.reply(
        `Giveaway setup has been cancelled.\nI need ${parsePermissions(SETUP_PERMS)} in ${targetChannel}`
      );
    }

    // wait for duration
    reply = await waitFor("Please `specify the duration` of the giveaway in minutes");
    if (reply === false) return;
    duration = reply.content;
    if (isNaN(duration)) return reply.reply("Giveaway setup has been cancelled. You did not specify a duration");

    // wait for prize
    reply = await waitFor("Please `specify the prize` of the giveaway");
    if (reply === false) return;
    prize = reply.content;

    // winner count
    reply = await waitFor("Please `specify the number of winners`");
    if (reply === false) return;
    winners = reply.content;
    if (isNaN(winners)) {
      return reply.reply("Giveaway setup has been cancelled. You did not specify a number of winners");
    }
    winners = parseInt(winners);

    // host
    reply = await waitFor(
      "Please `mention the user` that will host the giveaway. Alternatively, you can specify `none`"
    );
    if (reply === false) return;
    host = reply.mentions.users.first();
    if (!host) host = null;

    // wait for confirmation
    reply = await waitFor(
      `Are you sure you want to host a giveaway in ${targetChannel} for ${duration} minutes with ${prize} for ${winners} winners?\n\n Type \`yes\` to confirm`
    );
    if (reply === false) return;
    if (reply.content.toLowerCase() !== "yes") {
      return reply.reply("Giveaway setup has been cancelled");
    }

    const response = await start(message.member, targetChannel, duration, prize, winners, host);
    await channel.send(response);
  } catch (e) {
    await channel.send({ embeds: [embed.setDescription("An error occurred while setting up the giveaway")] });
  }
}

// Interactive Giveaway Update
async function runInteractiveEdit(message) {
  const { member, channel } = message;

  const SETUP_TIMEOUT = 30 * 1000;

  const filter = (m) => m.author.id === member.id;
  const embed = new MessageEmbed()
    .setAuthor({ name: "Giveaway Update" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setFooter({ text: "Type `cancel` to cancel update!\nType `skip` to skip this step" });

  let messageId;
  let addDuration;
  let newPrize;
  let newWinnerCount;

  const waitFor = async (question) => {
    await channel.send({ embeds: [embed.setDescription(question)] });
    try {
      let reply = (await channel.awaitMessages({ filter, max: 1, time: SETUP_TIMEOUT, errors: ["time"] })).first();
      if (reply.content.toLowerCase() === "cancel") {
        await reply.reply("Giveaway update has been cancelled");
        return false;
      }

      return reply;
    } catch (err) {
      await channel.send({
        embeds: [embed.setDescription("No response received. Giveaway update has been cancelled")],
      });
      return false;
    }
  };

  let reply;
  try {
    // wait for messageId
    reply = await waitFor("Please enter the `messageId` of the existing giveaway");
    if (reply === false) return;
    messageId = reply.content;

    // wait for addDuration
    reply = await waitFor("Please specify the `duration to add` to the giveaway in minutes");
    if (reply === false) return;
    if (reply.content.toLowerCase() !== "skip") {
      addDuration = reply.content;
      if (isNaN(addDuration)) return reply.reply("Giveaway update has been cancelled. You did not specify a duration");
    }

    // wait for new prize
    reply = await waitFor("Please specify the `new prize` of the giveaway");
    if (reply.content.toLowerCase() !== "skip") {
      if (reply === false) return;
      newPrize = reply.content;
    }

    // winner count
    reply = await waitFor("Please specify the `new number of winners`");
    if (reply === false) return;
    if (reply.content.toLowerCase() !== "skip") {
      newWinnerCount = reply.content;
      if (isNaN(newWinnerCount)) {
        return reply.reply("Giveaway setup has been cancelled. You did not specify a number of winners");
      }
      newWinnerCount = parseInt(newWinnerCount);
    }

    const response = await edit(message.member, messageId, addDuration, newPrize, newWinnerCount);
    await channel.send(response);
  } catch (e) {
    await channel.send({ embeds: [embed.setDescription("An error occurred while setting up the giveaway")] });
  }
}
