const { Message } = require("discord.js");
const { IMAGE_API } = require("@root/config.json");
const { getMember } = require("./botUtils");

/**
 * @param {Message} message
 * @param {String[]} args
 */
async function getImageFromCommand(message, args) {
  let url;

  // check for attachments
  if (message.attachments.size > 0) {
    const attachment = message.attachments.first();
    const attachUrl = attachment.url;
    const attachIsImage = attachUrl.endsWith(".png") || attachUrl.endsWith(".jpg") || attachUrl.endsWith(".jpeg");
    if (attachIsImage) url = attachUrl;
  }

  if (!url && args.length == 0) url = message.author.displayAvatarURL({ size: 256, format: "png" });

  if (!url && args.length != 0) {
    try {
      url = new URL(args[0]).href;
    } catch (ex) {}
  }

  if (!url && message.mentions.users.size > 0) {
    url = message.mentions.users.first().displayAvatarURL({ size: 256, format: "png" });
  }

  if (!url) {
    let member = await getMember(message, args[0]).catch((ex) => {});
    if (member) url = member.user.displayAvatarURL({ size: 256, format: "png" });
  }

  if (!url) url = message.author.displayAvatarURL({ size: 256, format: "png" });

  return url;
}

/**
 * @param {String} genName
 * @param {String} image
 */
function getGenerator(genName, image) {
  const endpoint = new URL(IMAGE_API + "/generators/" + genName);
  endpoint.searchParams.append("image", image);
  return endpoint.href;
}

/**
 * @param {String} genName
 * @param {String} image
 */
function getFilter(filter, image) {
  const endpoint = new URL(IMAGE_API + "/filters/" + filter);
  endpoint.searchParams.append("image", image);
  return endpoint.href;
}

module.exports = {
  getImageFromCommand,
  getGenerator,
  getFilter,
};
