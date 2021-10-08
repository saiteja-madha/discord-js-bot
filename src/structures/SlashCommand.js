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
   * @property {boolean} enabled - Whether the slash command is enabled or not
   * @property {boolean} ephemeral - Whether the reply should be ephemeral
   * @property {ApplicationCommandOptionData[]} options - Command options
   * @property {PermissionResolvable[]} userPermissions - Permissions required by the user to use the command.
   */

  /**
   * @param {BotClient} client - The discord client
   * @param {CommandData} data - The command information
   */
  constructor(client, data) {
    if (typeof this.run !== "function") throw new Error("Missing run() method");
    this.client = client;
    this.name = data.name;
    this.description = data.description;
    this.enabled = data.enabled || true;
    this.ephemeral = data.ephemeral || false;
    this.options = data.options || [];
    this.userPermissions = data.userPermissions || [];
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
};
