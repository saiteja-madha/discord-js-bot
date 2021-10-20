const LINK_PATTERN =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

const DISCORD_INVITE_PATTERN =
  /(https?:\/\/)?(www.)?(discord.(gg|io|me|li|link|plus)|discorda?p?p?.com\/invite|invite.gg|dsc.gg|urlcord.cf)\/[^\s/]+?(?=\b)/;

/**
 * Returns true if provided text contains any link
 * @param {string} text
 */
exports.containsLink = (text) => LINK_PATTERN.test(text);

/**
 * Returns true if provided text contains any discord invite
 * @param {string} text
 */
exports.containsDiscordInvite = (text) => DISCORD_INVITE_PATTERN.test(text);

/**
 * Get a random int within the provided range
 * @param {string} max
 */
exports.getRandomInt = (max) => Math.floor(Math.random() * max);

/**
 * Returns true if provided text is a HEX Value
 * @param {string} text
 */
exports.isHex = (text) => /^#[0-9A-F]{6}$/i.test(text);

/**
 * Returns the number of hours between provided dates
 * @param {Date} dt2
 * @param {Date} dt1
 */
exports.diffHours = (dt2, dt1) => {
  let diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60 * 60;
  return Math.abs(Math.round(diff));
};

/**
 * Converts time to valid time string
 * @param {number} timeInSeconds
 */
exports.timeformat = (timeInSeconds) => {
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
};

/**
 * Return time remaining until provided date
 * @param {Date} timeUntil
 */
exports.getRemainingTime = (timeUntil) => {
  const seconds = Math.abs((timeUntil - new Date()) / 1000);
  return this.timeformat(seconds);
};

/**
 * Converts duration to milliseconds
 * @param {string} duration
 */
exports.durationToMillis = (duration) =>
  duration
    .split(":")
    .map(Number)
    .reduce((acc, curr) => curr + acc * 60) * 1000;

/**
 * Return true if 2 array elements are equal
 * @param {Array} arr1
 * @param {Array} arr2
 */
exports.compareArrays = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  const uniqueValues = new Set([...arr1, ...arr2]);
  for (const v of uniqueValues) {
    const aCount = arr1.filter((e) => e === v).length;
    const bCount = arr2.filter((e) => e === v).length;
    if (aCount !== bCount) return false;
  }
  return true;
};
