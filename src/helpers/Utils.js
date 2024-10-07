const { COLORS } = require("@src/data.json");
const { readdirSync, lstatSync } = require("fs");
const { join, extname } = require("path");
const permissions = require("./permissions");

module.exports = class Utils {
  /**
   * Checks if a string contains a URL
   * @param {string} text
   */
  static containsLink(text) {
    return /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/.test(
      text
    );
  }

  /**
   * Checks if a string is a valid discord invite
   * @param {string} text
   */
  static containsDiscordInvite(text) {
    return /(https?:\/\/)?(www.)?(discord.(gg|io|me|li|link|plus)|discorda?p?p?.com\/invite|invite.gg|dsc.gg|urlcord.cf)\/[^\s/]+?(?=\b)/.test(
      text
    );
  }

  /**
   * Returns a random number below a max
   * @param {number} max
   */
  static getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  /**
   * Checks if a string is a valid Hex color
   * @param {string} text
   */
  static isHex(text) {
    return /^#[0-9A-F]{6}$/i.test(text);
  }

  /**
   * Checks if a string is a valid Hex color
   * @param {string} text
   */
  static isValidColor(text) {
    if (COLORS.indexOf(text) > -1) {
      return true;
    } else return false;
  }

  /**
   * Returns hour difference between two dates
   * @param {Date} dt2
   * @param {Date} dt1
   */
  static diffHours(dt2, dt1) {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60 * 60;
    return Math.abs(Math.round(diff));
  }

  /**
   * Returns remaining time in days, hours, minutes and seconds
   * @param {number} timeInSeconds
   */
  static timeformat(timeInSeconds) {
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
   * Converts duration to milliseconds
   * @param {string} duration
   */
  static durationToMillis(duration) {
    return (
      duration
        .split(":")
        .map(Number)
        .reduce((acc, curr) => curr + acc * 60) * 1000
    );
  }

  /**
   * Returns time remaining until provided date
   * @param {Date} timeUntil
   */
  static getRemainingTime(timeUntil) {
    const seconds = Math.abs((timeUntil - new Date()) / 1000);
    const time = Utils.timeformat(seconds);
    return time;
  }

  /**
   * @param {import("discord.js").PermissionResolvable[]} perms
   */
  static parsePermissions(perms) {
    const permissionWord = `permission${perms.length > 1 ? "s" : ""}`;
    return "`" + perms.map((perm) => permissions[perm]).join(", ") + "` " + permissionWord;
  }

  /**
   * Recursively searches for a file in a directory
   * @param {string} dir
   * @param {string[]} allowedExtensions
   */
  static recursiveReadDirSync(dir, allowedExtensions = [".js"]) {
    const filePaths = [];
    const readCommands = (dir) => {
      const files = readdirSync(join(process.cwd(), dir));
      files.forEach((file) => {
        const stat = lstatSync(join(process.cwd(), dir, file));
        if (stat.isDirectory()) {
          readCommands(join(dir, file));
        } else {
          const extension = extname(file);
          if (!allowedExtensions.includes(extension)) return;
          const filePath = join(process.cwd(), dir, file);
          filePaths.push(filePath);
        }
      });
    };
    readCommands(dir);
    return filePaths;
  }
  
  /**
   * Formats milliseconds into days, hours, minutes, and seconds
   * @param {number} ms - Milliseconds
   * @returns {string} - Formatted time string
   */
  static formatTime(ms) {
    const minuteMs = 60 * 1000;
    const hourMs = 60 * minuteMs;
    const dayMs = 24 * hourMs;
    if (ms < minuteMs) {
      return `${ms / 1000}s`;
    } else if (ms < hourMs) {
      return `${Math.floor(ms / minuteMs)}m ${Math.floor((ms % minuteMs) / 1000)}s`;
    } else if (ms < dayMs) {
      return `${Math.floor(ms / hourMs)}h ${Math.floor((ms % hourMs) / minuteMs)}m`;
    } else {
      return `${Math.floor(ms / dayMs)}d ${Math.floor((ms % dayMs) / hourMs)}h`;
    }
  }

  /**
   * Parses a time string into milliseconds
   * @param {string} string - The time string (e.g., "1d", "2h", "3m", "4s")
   * @returns {number} - The time in milliseconds
   */

  static parseTime(string) {
    const time = string.match(/([0-9]+[d,h,m,s])/g);
    if (!time) return 0;
    let ms = 0;
    for (const t of time) {
      const unit = t[t.length - 1];
      const amount = Number(t.slice(0, -1));
      if (unit === "d") ms += amount * 24 * 60 * 60 * 1000;
      else if (unit === "h") ms += amount * 60 * 60 * 1000;
      else if (unit === "m") ms += amount * 60 * 1000;
      else if (unit === "s") ms += amount * 1000;
    }
    return ms;
  }

  /**
   * Updates voice channel status
   * @param {string} channel - The voice channel ID
   * @param {string} status - The status to update
   * @param {object} client - The bot client
   */
  static async vcUpdate(client, channelId, status) {
    const url = `/channels/${channelId}/voice-status`;
    const payload = {
      status: status,
    };
    await client.rest.put(url, { body: payload }).catch(() => {});
  }
};
