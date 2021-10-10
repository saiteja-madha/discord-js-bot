/* eslint-disable no-unused-vars */
const {
  ApplicationCommandOptionData,
  PermissionResolvable,
  CommandInteraction,
  CommandInteractionOptionResolver,
} = require("discord.js");
const { permissions } = require("@utils/botUtils");
const { timeformat } = require("@utils/miscUtils");
const BotClient = require("./BotClient");

module.exports = class SlashCommand {
  /**
   * @typedef {Object} CommandData
   * @property {string} name - The name of the command (must be lowercase)
   * @property {string} description - A short description of the command
   * @property {boolean} [enabled] - Whether the slash command is enabled or not
   * @property {boolean} [ephemeral] - Whether the reply should be ephemeral
   * @property {ApplicationCommandOptionData[]} [options] - Command options
   * @property {PermissionResolvable[]} [userPermissions] - Permissions required by the user to use the command.
   * @property {number} [cooldown] - Command cooldown in seconds
   */

  /**
   * @param {BotClient} client - The discord client
   * @param {CommandData} data - The command information
   */
  constructor(client, data) {
    this.constructor.validateInfo(client, data);
    if (typeof this.run !== "function") throw new Error("Missing run() method");
    this.client = client;
    this.name = data.name;
    this.description = data.description;
    this.enabled = Object.prototype.hasOwnProperty.call(data, "enabled") ? data.enabled : true;
    this.ephemeral = Object.prototype.hasOwnProperty.call(data, "ephemeral") ? data.ephemeral : false;
    this.options = data.options || [];
    this.userPermissions = data.userPermissions || [];
    this.cooldown = data.cooldown || 0;
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  async execute(interaction, options) {
    if (this.cooldown > 0) {
      const remaining = this.getRemainingCooldown(interaction.user.id);
      if (remaining > 0) {
        return interaction.followUp(`You are on cooldown. You can use the command after ${timeformat(remaining)}`);
      }
    }

    if (interaction.member && this.userPermissions.length > 0) {
      if (!interaction.member.permissions.has(this.userPermissions)) {
        return interaction.followUp(`You need ${this.parsePermissions(this.userPermissions)} for this command`);
      }
    }

    try {
      await this.run(interaction, options);
    } catch (ex) {
      interaction.followUp("Oops! An error occurred while running the command");
      this.client.logger.error("interactionRun", ex);
    }
  }

  /**
   * Get remaining cooldown for the user
   * @param {string} userId
   */
  getRemainingCooldown(userId) {
    const key = this.name + "|" + userId;
    if (this.client.slashCooldownCache.has(key)) {
      const remaining = (Date.now() - this.client.slashCooldownCache.get(key)) * 0.001;
      if (remaining > this.cooldown) {
        this.client.slashCooldownCache.delete(key);
        return 0;
      }
      return this.cooldown - remaining;
    }
    return 0;
  }

  /**
   * Apply cooldown to the user
   * @param {string} memberId
   */
  applyCooldown(memberId) {
    const key = this.name + "|" + memberId;
    this.client.cmdCooldownCache.set(key, Date.now());
  }

  /**
   * Parse permissions to string
   * @param {PermissionResolvable[]} perms
   */
  parsePermissions(perms) {
    const permissionWord = `permission${perms.length > 1 ? "s" : ""}`;
    return perms.map((perm) => `\`${permissions[perm]}\``).join(", ") + permissionWord;
  }

  /**
   * Validates constructor parameters
   * @param {BotClient} client
   * @param {CommandData} data
   */
  static validateInfo(client, data) {
    if (!client) throw new Error("A client must be specified");
    if (typeof data !== "object") {
      throw new TypeError("Command data must be an object");
    }
    if (typeof data.name !== "string" || data.name !== data.name.toLowerCase()) {
      throw new Error("Command name must be a lowercase string.");
    }
    if (typeof data.description !== "string") {
      throw new TypeError("Command description must be a string.");
    }
    if (Object.prototype.hasOwnProperty.call(data, "enabled") && typeof data.enabled !== "boolean") {
      throw new TypeError("Command enabled must be a boolean value");
    }
    if (Object.prototype.hasOwnProperty.call(data, "ephemeral") && typeof data.ephemeral !== "boolean") {
      throw new TypeError("Command enabled must be a boolean value");
    }
    if (data.options && !Array.isArray(data.options)) {
      throw new TypeError("Command options must be a array");
    }
    if (Object.prototype.hasOwnProperty.call(data, "cooldown") && typeof data.cooldown !== "number") {
      throw new TypeError("Command cooldown must be a number");
    }
    if (data.userPermissions) {
      if (!Array.isArray(data.userPermissions)) {
        throw new TypeError("Command userPermissions must be an Array of permission key strings.");
      }
      for (const perm of data.userPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
      }
    }
  }
};
