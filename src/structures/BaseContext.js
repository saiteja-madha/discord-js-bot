const { permissions, parsePermissions } = require("@utils/botUtils");
const { timeformat } = require("@utils/miscUtils");

class BaseContext {
  /**
   * @typedef {Object} ContextData
   * @property {string} name - The name of the command (must be lowercase)
   * @property {string} description - A short description of the command
   * @property {"USER"|"MESSAGE"} type - The type of application command
   * @property {boolean} [enabled] - Whether the slash command is enabled or not
   * @property {boolean} [ephemeral] - Whether the reply should be ephemeral
   * @property {boolean} [defaultPermission] - Whether default permission must be enabled
   * @property {import('discord.js').PermissionResolvable[]} [userPermissions] - Permissions required by the user to use the command.
   * @property {number} [cooldown] - Command cooldown in seconds
   */

  /**
   * @param {import('discord.js').Client} client - The discord client
   * @param {ContextData} data - The context information
   */
  constructor(client, data) {
    this.constructor.validateInfo(client, data);
    if (typeof this.run !== "function") throw new Error("Missing run() method");
    this.client = client;
    this.name = data.name;
    this.description = data.description;
    this.type = data.type;
    this.enabled = Object.prototype.hasOwnProperty.call(data, "enabled") ? data.enabled : true;
    this.ephemeral = Object.prototype.hasOwnProperty.call(data, "ephemeral") ? data.ephemeral : false;
    this.options = Object.prototype.hasOwnProperty.call(data, "defaultPermission") ? data.defaultPermission : true;
    this.userPermissions = data.userPermissions || [];
    this.cooldown = data.cooldown || 0;
  }

  /**
   * @param {import('discord.js').ContextMenuInteraction} interaction
   */
  async execute(interaction) {
    if (this.cooldown > 0) {
      const remaining = this.getRemainingCooldown(interaction.user.id);
      if (remaining > 0) {
        return interaction.reply({
          content: `You are on cooldown. You can again use the command after ${timeformat(remaining)}`,
          ephemeral: true,
        });
      }
    }

    if (interaction.member && this.userPermissions.length > 0) {
      if (!interaction.member.permissions.has(this.userPermissions)) {
        return interaction.reply({
          content: `You need ${parsePermissions(this.userPermissions)} for this command`,
          ephemeral: true,
        });
      }
    }

    try {
      await interaction.deferReply({ ephemeral: this.ephemeral });
      await this.run(interaction);
    } catch (ex) {
      interaction.followUp("Oops! An error occurred while running the command");
      this.client.logger.error("contextRun", ex);
    } finally {
      this.applyCooldown(interaction.user.id);
    }
  }

  /**
   * Get remaining cooldown for the user
   * @param {string} userId
   */
  getRemainingCooldown(userId) {
    const key = this.name + "|" + userId;
    if (this.client.ctxCooldownCache.has(key)) {
      const remaining = (Date.now() - this.client.ctxCooldownCache.get(key)) * 0.001;
      if (remaining > this.cooldown) {
        this.client.ctxCooldownCache.delete(key);
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
    this.client.ctxCooldownCache.set(key, Date.now());
  }

  /**
   * Validates constructor parameters
   * @param {import('discord.js').Client} client
   * @param {ContextData} data
   * @private
   */
  static validateInfo(client, data) {
    if (!client) throw new Error("A client must be specified");
    if (typeof data !== "object") {
      throw new TypeError("Context data must be an object");
    }
    if (typeof data.name !== "string" || data.name !== data.name.toLowerCase()) {
      throw new Error("Context name must be a lowercase string.");
    }
    if (typeof data.description !== "string") {
      throw new TypeError("Context description must be a string.");
    }
    if (data.type !== "USER" && data.type !== "MESSAGE") {
      throw new TypeError("Context type must be a either USER/MESSAGE.");
    }
    if (Object.prototype.hasOwnProperty.call(data, "enabled") && typeof data.enabled !== "boolean") {
      throw new TypeError("Context enabled must be a boolean value");
    }
    if (Object.prototype.hasOwnProperty.call(data, "ephemeral") && typeof data.ephemeral !== "boolean") {
      throw new TypeError("Context enabled must be a boolean value");
    }
    if (
      Object.prototype.hasOwnProperty.call(data, "defaultPermission") &&
      typeof data.defaultPermission !== "boolean"
    ) {
      throw new TypeError("Context defaultPermission must be a boolean value");
    }
    if (Object.prototype.hasOwnProperty.call(data, "cooldown") && typeof data.cooldown !== "number") {
      throw new TypeError("Context cooldown must be a number");
    }
    if (data.userPermissions) {
      if (!Array.isArray(data.userPermissions)) {
        throw new TypeError("Context userPermissions must be an Array of permission key strings.");
      }
      for (const perm of data.userPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
      }
    }
  }
}

module.exports = BaseContext;
