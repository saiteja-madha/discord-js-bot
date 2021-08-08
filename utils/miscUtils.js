const LINK_PATTERN = new RegExp(
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
);

const DISCORD_INVITE_PATTERN = new RegExp(
  "(?:https?://)?(?:\\w+\\.)?discord(?:(?:app)?\\.com/invite|\\.gg)/(?<code>[a-z0-9-]+)(?:\\?\\S*)?(?:#\\S*)?",
  "g"
);

/**
 * @param {String} text
 */
function containsLink(text) {
  return LINK_PATTERN.test(text);
}

/**
 * @param {String} text
 */
function containsDiscordInvite(text) {
  return DISCORD_INVITE_PATTERN.test(text);
}

/**
 * @param {Number} max
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/**
 * @param {String} text
 */
function isHex(text) {
  return /^#[0-9A-F]{6}$/i.test("#AABBCC");
}

module.exports = {
  containsLink,
  containsDiscordInvite,
  getRandomInt,
  isHex,
};
