const { ApplicationCommandOptionType } = require("discord.js");

const discordTogether = [
  "youtube",
  "poker",
  "chess",
  "checkers",
  "betrayal",
  "fishing",
  "lettertile",
  "wordsnack",
  "doodlecrew",
  "spellcast",
  "awkword",
  "puttparty",
  "sketchheads",
  "ocho",
];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "together",
  description: "discord together",
  category: "FUN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    aliases: ["discordtogether"],
    usage: "<game>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "type",
        description: "type",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: discordTogether.map((game) => ({ name: game, value: game })),
      },
    ],
  },

  async messageRun(message, args) {
    const input = args[0];
    const response = await getTogetherInvite(message.member, input);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("type");
    const response = await getTogetherInvite(interaction.member, choice);
    await interaction.followUp(response);
  },
};

async function getTogetherInvite(member, choice) {
  const { client } = member;

  const vc = member.voice.channel?.id;
  if (!vc) return "You must be in a voice channel to use this command.";

  let invite;
  switch (choice.toLowerCase()) {
    case "youtube":
      invite = await client.discordTogether.createTogetherCode(vc, "youtube");
      break;

    case "poker":
      invite = await client.discordTogether.createTogetherCode(vc, "poker");
      break;

    case "chess":
      invite = await client.discordTogether.createTogetherCode(vc, "chess");
      break;

    case "checkers":
      invite = await client.discordTogether.createTogetherCode(vc, "checkers");
      break;

    case "betrayal":
      invite = await client.discordTogether.createTogetherCode(vc, "betrayal");
      break;

    case "fishing":
      invite = await client.discordTogether.createTogetherCode(vc, "fishing");
      break;

    case "lettertile":
      invite = await client.discordTogether.createTogetherCode(vc, "lettertile");
      break;

    case "wordsnack":
      invite = await client.discordTogether.createTogetherCode(vc, "wordsnack");
      break;

    case "doodlecrew":
      invite = await client.discordTogether.createTogetherCode(vc, "doodlecrew");
      break;

    case "spellcast":
      invite = await client.discordTogether.createTogetherCode(vc, "spellcast");
      break;

    case "awkword":
      invite = await client.discordTogether.createTogetherCode(vc, "awkword");
      break;

    case "puttparty":
      invite = await client.discordTogether.createTogetherCode(vc, "puttparty");
      break;

    case "sketchheads":
      invite = await client.discordTogether.createTogetherCode(vc, "sketchheads");
      break;

    case "ocho":
      invite = await client.discordTogether.createTogetherCode(vc, "ocho");
      break;

    default:
      return `Invalid game.\nValid games: ${discordTogether.join(", ")}`;
  }

  return `${invite.code}`;
}
