const CommandCategory = require("@structures/CommandCategory");
const { permissions } = require("@utils/botUtils");

module.exports = class Validator {
  /**
   * @param {import('@src/structures/Command')} cmd
   */
  static validateCommand(cmd) {
    if (typeof cmd !== "object") {
      throw new TypeError("Command data must be an Object.");
    }
    if (typeof cmd.name !== "string" || cmd.name !== cmd.name.toLowerCase()) {
      throw new Error("Command name must be a lowercase string.");
    }
    if (typeof cmd.description !== "string") {
      throw new TypeError("Command description must be a string.");
    }
    if (cmd.cooldown && typeof cmd.cooldown !== "number") {
      throw new TypeError("Command cooldown must be a number");
    }
    if (cmd.category) {
      if (!Object.prototype.hasOwnProperty.call(CommandCategory, cmd.category)) {
        throw new Error(`Not a valid category ${cmd.category}`);
      }
    }
    if (cmd.userPermissions) {
      if (!Array.isArray(cmd.userPermissions)) {
        throw new TypeError("Command userPermissions must be an Array of permission key strings.");
      }
      for (const perm of cmd.userPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
      }
    }
    if (cmd.botPermissions) {
      if (!Array.isArray(cmd.botPermissions)) {
        throw new TypeError("Command botPermissions must be an Array of permission key strings.");
      }
      for (const perm of cmd.botPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command botPermission: ${perm}`);
      }
    }
    if (cmd.validations) {
      if (!Array.isArray(cmd.validations)) {
        throw new TypeError("Command validations must be an Array of validation Objects.");
      }
      for (const validation of cmd.validations) {
        if (typeof validation !== "object") {
          throw new TypeError("Command validations must be an object.");
        }
        if (typeof validation.callback !== "function") {
          throw new TypeError("Command validation callback must be a function.");
        }
        if (typeof validation.message !== "string") {
          throw new TypeError("Command validation message must be a string.");
        }
      }
    }

    // Validate Command Details
    if (cmd.command) {
      if (typeof cmd.command !== "object") {
        throw new TypeError("Command.command must be an object");
      }
      if (Object.prototype.hasOwnProperty.call(cmd.command, "enabled") && typeof cmd.command.enabled !== "boolean") {
        throw new TypeError("Command.command enabled must be a boolean value");
      }
      if (
        cmd.command.aliases &&
        (!Array.isArray(cmd.command.aliases) ||
          cmd.command.aliases.some((ali) => typeof ali !== "string" || ali !== ali.toLowerCase()))
      ) {
        throw new TypeError("Command.command aliases must be an Array of lowercase strings.");
      }
      if (cmd.command.usage && typeof cmd.command.usage !== "string") {
        throw new TypeError("Command.command usage must be a string");
      }
      if (cmd.command.minArgsCount && typeof cmd.command.minArgsCount !== "number") {
        throw new TypeError("Command.command minArgsCount must be a number");
      }
      if (cmd.command.subcommands && !Array.isArray(cmd.command.subcommands)) {
        throw new TypeError("Command.command subcommands must be an array");
      }
      if (cmd.command.subcommands) {
        for (const sub of cmd.command.subcommands) {
          if (typeof sub !== "object") {
            throw new TypeError("Command.command subcommands must be an array of objects");
          }
          if (typeof sub.trigger !== "string") {
            throw new TypeError("Command.command subcommand trigger must be a string");
          }
          if (typeof sub.description !== "string") {
            throw new TypeError("Command.command subcommand description must be a string");
          }
        }
      }
      if (cmd.command.enabled && typeof cmd.messageRun !== "function") {
        throw new TypeError("Missing 'messageRun' function");
      }
    }

    // Validate Slash Command Details
    if (cmd.slashCommand) {
      if (typeof cmd.slashCommand !== "object") {
        throw new TypeError("Command.slashCommand must be an object");
      }
      if (
        Object.prototype.hasOwnProperty.call(cmd.slashCommand, "enabled") &&
        typeof cmd.slashCommand.enabled !== "boolean"
      ) {
        throw new TypeError("Command.slashCommand enabled must be a boolean value");
      }
      if (
        Object.prototype.hasOwnProperty.call(cmd.slashCommand, "ephemeral") &&
        typeof cmd.slashCommand.ephemeral !== "boolean"
      ) {
        throw new TypeError("Command.slashCommand ephemeral must be a boolean value");
      }
      if (cmd.slashCommand.options && !Array.isArray(cmd.slashCommand.options)) {
        throw new TypeError("Command.slashCommand options must be a array");
      }
      if (cmd.slashCommand.enabled && typeof cmd.interactionRun !== "function") {
        throw new TypeError("Missing 'interactionRun' function");
      }
    }
  }
};
