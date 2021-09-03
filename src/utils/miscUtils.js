const LINK_PATTERN =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

const DISCORD_INVITE_PATTERN =
  /(https?:\/\/)?(www.)?(discord.(gg|io|me|li|link|plus)|discorda?p?p?.com\/invite|invite.gg|dsc.gg|urlcord.cf)\/[^\s/]+?(?=\b)/;

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
  return /^#[0-9A-F]{6}$/i.test(text);
}

/**
 * @param {Date} dt2
 * @param {Date} dt1
 */
function diffHours(dt2, dt1) {
  let diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60 * 60;
  return Math.abs(Math.round(diff));
}

/**
 * @param {number} timeInSeconds
 */
function timeformat(timeInSeconds) {
  const days = Math.floor((timeInSeconds % 31536000) / 86400);
  const hours = Math.floor((timeInSeconds % 86400) / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.round(timeInSeconds % 60);
  return (
    (days > 0 ? `${days} days, ` : "") +
    (hours > 0 ? `${hours} hours, ` : "") +
    (minutes > 0 ? `${minutes} minutes, ` : "") +
    (seconds > 0 ? `${seconds} seconds` : "")
  );
}

/**
 * @param {Date} timeUntil
 */
function getRemainingTime(timeUntil) {
  const seconds = Math.abs((timeUntil - new Date()) / 1000);
  const time = timeformat(seconds);
  return time;
}

module.exports = {
  containsLink,
  containsDiscordInvite,
  getRandomInt,
  isHex,
  diffHours,
  timeformat,
  getRemainingTime,
};
