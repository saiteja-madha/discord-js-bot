const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { isTranslated, logTranslation } = require("@schemas/TranslateLog");
const data = require("@src/data.json");
const { getCountryLanguages } = require("country-language");
const { sendMessage } = require("@utils/botUtils");
const { translate } = require("@utils/httpUtils");
const { timeformat } = require("@utils/miscUtils");

const TRANSLATE_COOLDOWN = 120;
const cooldownCache = new Map();

/**
 * @param {import('discord.js').User} user
 */
const getTranslationCooldown = (user) => {
  if (cooldownCache.has(user.id)) {
    const remaining = (Date.now() - cooldownCache.get(user.id)) * 0.001;
    if (remaining > TRANSLATE_COOLDOWN) {
      cooldownCache.delete(user.id);
      return 0;
    }
    return TRANSLATE_COOLDOWN - remaining;
  }
  return 0;
};

/**
 * @param {string} countryCode
 * @param {import("discord.js").Message} message
 * @param {import("discord.js").User} user
 */
async function handleFlagReaction(countryCode, message, user) {
  // cooldown check
  const remaining = getTranslationCooldown(user);
  if (remaining > 0) {
    return sendMessage(message.channel, `${user} You must wait ${timeformat(remaining)} before translating again!`, 5);
  }

  if (await isTranslated(message, countryCode)) return;

  getCountryLanguages(countryCode, async (err, languages) => {
    if (err) return;

    // filter languages for which google translation is available
    const targetCodes = languages
      .filter((language) => data.GOOGLE_TRANSLATE[language.iso639_1] !== undefined)
      .map((language) => language.iso639_1);

    if (targetCodes.length === 0) return;

    // remove english if there are other language codes
    if (targetCodes.length > 1 && targetCodes.includes("en")) {
      targetCodes.splice(targetCodes.indexOf("en"), 1);
    }

    let src;
    let desc = "";
    let translated = 0;
    for (const tc of targetCodes) {
      const response = await translate(message.content, tc);
      if (!response) continue;
      src = response.inputLang;
      desc += `**${response.outputLang}:**\n${response.output}\n\n`;
      translated += 1;
    }

    if (translated === 0) return;

    const btnRow = new MessageActionRow().addComponents(
      new MessageButton({
        url: message.url,
        label: "Original Message",
        style: "LINK",
      })
    );

    const embed = new MessageEmbed()
      .setColor(message.client.config.EMBED_COLORS.BOT_EMBED)
      .setAuthor({ name: `Translation from ${src}` })
      .setDescription(desc)
      .setFooter({
        text: `Requested by ${user.tag}`,
        iconURL: user.displayAvatarURL(),
      });

    sendMessage(message.channel, { embeds: [embed], components: [btnRow] }).then(
      () => cooldownCache.set(user.id, Date.now()) // set cooldown
    );

    logTranslation(message, countryCode);
  });
}

module.exports = {
  handleFlagReaction,
};
