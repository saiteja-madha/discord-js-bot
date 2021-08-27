const { Client, MessageEmbed } = require("discord.js");
const { translate } = require("@utils/httpUtils");
const { sendMessage } = require("@utils/botUtils");
const { EMBED_COLORS } = require("@root/config");
const { getCountryLanguages } = require("country-language");
const { getSettings } = require("@schemas/guild-schema");
const data = require("@src/data.json");

/**
 * @param {Client} client
 */
async function init(client) {
  client.on("messageReactionAdd", async (reaction, user) => {
    const settings = (await getSettings(message.guild)).flag_translation;
    if (!settings.enabled) return;

    if (reaction.partial) reaction = await reaction.fetch();
    const { message, emoji } = reaction;
    if (message.webhookId || !message.content) return;
    if (settings.channels.length > 1 && !settings.channels.includes(message.channelId)) return;

    if (emoji.name?.length === 4) {
      if (user.partial) user = await user.fetch();
      if (user.bot) return;

      const l1 = emoji.name[0] + emoji.name[1];
      const l2 = emoji.name[2] + emoji.name[3];
      const countryCode = data.UNICODE_LETTER[l1] + data.UNICODE_LETTER[l2];

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
        for (const tc of targetCodes) {
          const data = await translate(message.content, tc);
          src = data.inputLang;
          desc += `**${data.outputLang}:**\n${data.output}\n\n`;
        }

        let head = `Original Message: [here](${message.url})\nSource Language: ${src}\n\n`;
        const embed = new MessageEmbed()
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setAuthor(`Translation`)
          .setDescription(head + desc)
          .setFooter(`Requested by ${user.tag}`, user.displayAvatarURL());

        sendMessage(message.channel, { embeds: [embed] });
      });
    }
  });
}

module.exports = {
  init,
};
