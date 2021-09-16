const {
  PermissionResolvable,
  Client,
  MessageEmbed,
  BaseGuildTextChannel,
  Message,
  CommandInteraction,
  CommandInteractionOptionResolver,
  // eslint-disable-next-line no-unused-vars
  ApplicationCommandOptionData,
} = require("discord.js");

const { permissions, sendMessage } = require("@utils/botUtils");
const { EMOJIS, EMBED_COLORS, PREFIX } = require("@root/config.js");
const { timeformat } = require("@utils/miscUtils");
const BotClient = require("./BotClient");

class Command {
  /**
   * @typedef {Object} SubCommand
   * @property {string} trigger - subcommand invoke
   * @property {string} description - subcommand description
   */

  /**
   * @typedef {"ADMIN" | "AUTOMOD" | "ECONOMY" | "FUN" | "IMAGE" | "INFORMATION" | "INVITE" | "MODERATION" | "MUSIC" |"NONE" | "OWNER" | "SOCIAL" | "TICKET" | "UTILITY" } CommandCategory
   */

  /**
   * @typedef {Object} InteractionInfo
   * @property {boolean} enabled - Whether the slash command is enabled or not
   * @property {boolean} ephemeral - Whether the reply should be ephemeral
   * @property {ApplicationCommandOptionData[]} options - command options
   */

  /**
   * @typedef {Object} CommandInfo
   * @property {boolean} enabled - Whether the command is enabled or not
   * @property {string[]} [aliases] - Alternative names for the command (all must be lowercase)
   * @property {string} [usage=""] - The command usage format string
   * @property {number} [minArgsCount=0] - Minimum number of arguments the command takes (default is 0)
   * @property {CommandCategory} category - The category this command belongs to
   * @property {SubCommand[]} [subcommands=[]] - List of subcommands
   * @property {PermissionResolvable[]} [botPermissions] - Permissions required by the client to use the command.
   * @property {PermissionResolvable[]} [userPermissions] - Permissions required by the user to use the command.
   * @property {boolean} [guildOwnerOnly=false] - Whether or not the command is usable only by the guild owner
   * @property {boolean} [botOwnerOnly=false] - Whether or not the command is usable only by the bot owner
   * @property {boolean} [nsfw=false] - Whether the command is usable only in NSFW channels.
   * @property {boolean} [hidden=false] - Whether the command should be hidden from the help command
   */

  /**
   * @typedef {Object} CommandData
   * @property {string} name - The name of the command (must be lowercase)
   * @property {string} description - A short description of the command
   * @property {number} cooldown - The command cooldown in seconds
   * @property {CommandInfo} command - A short description of the command
   * @property {InteractionInfo} slashCommand - A short description of the command
   */

  /**
   * @param {BotClient} client - The discord client
   * @param {CommandData} data - The command information
   */
  constructor(client, data) {
    this.constructor.validateInfo(client, data);
    this.client = client;
    this.name = data.name;
    this.description = data.description;
    this.cooldown = data.cooldown || 0;

    /**
     * @type {CommandInfo}
     */
    this.command = data.command || {};
    this.command.aliases = data.command.aliases || [];
    this.command.usage = data.command.usage || "";
    this.command.minArgsCount = data.command.minArgsCount || 0;
    this.command.category = data.command.category || "NONE";
    this.command.subcommands = data.command.subcommands || [];
    this.command.botPermissions = data.command.botPermissions || [];
    this.command.userPermissions = data.command.userPermissions || [];
    this.command.guildOwnerOnly = data.command.guildOwnerOnly || false;
    this.command.botOwnerOnly = data.command.botOwnerOnly || false;
    this.command.nsfw = data.command.nsfw || false;
    this.command.hidden = data.command.hidden || false;

    /**
     * @type {InteractionInfo}
     */
    this.slashCommand = data.slashCommand || {};
    this.slashCommand.enabled = data.slashCommand.enabled || false;
    this.slashCommand.ephemeral = data.slashCommand.ephemeral || false;
    this.slashCommand.options = data.slashCommand.options || [];
  }

  /**
   * Function that validates the message with the command options
   * @param {Message} message
   * @param {string[]} args
   * @param {string} invoke
   * @param {string} prefix
   */
  async execute(message, args, invoke, prefix) {
    const { channel, guild, member } = message;
    const options = this.command;

    if (this.cooldown > 0) {
      const remaining = this.getRemainingCooldown(member.id);
      if (remaining > 0) {
        return message.reply(`You are on cooldown. You can use the command after ${timeformat(remaining)}`);
      }
    }

    // Return if bot cannot send message
    if (!channel.permissionsFor(guild.me).has("SEND_MESSAGES")) return;

    // Check Arguments
    if (options.minArgsCount > 0 && args.length < options.minArgsCount) {
      return this.sendUsage(channel, prefix, invoke, "Missing arguments");
    }

    // Guild OwnerOnly check
    if (options.guildOwnerOnly && guild.ownerId !== member.id) {
      return message.reply(`The \`${this.name}\` command can only be used by the guild owner.`);
    }

    // Bot OwnerOnly check
    if (options.botOwnerOnly && !this.client.config.OWNER_IDS.includes(member.id)) {
      return message.reply(`The \`${this.name}\` command can only be used by the bot owner.`);
    }

    // NSFW command
    if (options.nsfw && !channel.nsfw) {
      return message.reply(`The \`${this.name}\` command can only be used in NSFW Channel.`);
    }

    // Check user permissions
    if (options.userPermissions.length > 0 && !channel.permissionsFor(member).has(options.userPermissions)) {
      return message.reply(`You need ${this.constructor.parsePermissions(options.userPermissions)} for this command`);
    }

    // Check bot permissions
    if (options.botPermissions.length > 0 && !channel.permissionsFor(guild.me).has(options.botPermissions)) {
      return message.reply(`I need ${this.constructor.parsePermissions(options.botPermissions)} for this command`);
    }

    await this.messageRun(message, args, invoke, prefix);
    this.applyCooldown(member.id);
  }

  /**
   * Function that is called when command is sent
   * @param {Message} message
   * @param {string[]} args
   * @param {string} invoke
   * @param {string} prefix
   */
  async messageRun(message, args, invoke, prefix) {
    if (this.command.enabled) {
      throw new Error(`${this.constructor.name} doesn't have a messageRun() method.`);
    }
  }

  /**
   * Function that is called when interaction is sent
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  async interactionRun(interaction, options) {
    if (this.slashCommand.enabled) {
      throw new Error(`${this.constructor.name} doesn't have a interactionRun() method.`);
    }
  }

  /**
   * @param {PermissionResolvable[]} perms
   */
  static parsePermissions(perms) {
    const permissionWord = `permission${perms.length > 1 ? "s" : ""}`;
    return perms.map((perm) => `\`${permissions[perm]}\``).join(", ") + permissionWord;
  }

  /**
   * Build a usage embed for this command
   * @param {string} prefix - command prefix
   * @param {string} invoke - alias that was used to trigger this command
   * @param {string} title - the embed title
   */
  getUsageEmbed(prefix = PREFIX, invoke = this.name, title = "Command Usage") {
    let desc = "";
    if (this.command.subcommands.length > 0) {
      this.command.subcommands.forEach((sub) => {
        desc += `${EMOJIS.ARROW} \`${invoke} ${sub.trigger}\`: ${sub.description}\n`;
      });
    } else {
      desc += `**Usage:**\n\`\`\`css\n${prefix}${invoke} ${this.command.usage}\`\`\``;
    }

    if (this.description !== "") desc += `\n**Help:** ${this.description}`;

    if (this.cooldown) {
      desc += `\n**Cooldown:** ${timeformat(this.cooldown)}`;
    }

    const embed = new MessageEmbed().setColor(EMBED_COLORS.BOT_EMBED).setDescription(desc);
    if (title) embed.setAuthor(title);
    return embed;
  }

  /**
   * send the commands usage embed
   * @param {BaseGuildTextChannel} channel - channel where the embed must be sent
   * @param {string} prefix - command prefix
   * @param {string} invoke - alias that was used to trigger this command
   * @param {string} title - the embed title
   */
  sendUsage(channel, prefix, invoke, title = "Command Usage") {
    const embed = this.getUsageEmbed(prefix, invoke, title);
    sendMessage(channel, { embeds: [embed] });
  }

  getRemainingCooldown(memberId) {
    const key = this.name + "|" + memberId;
    if (this.client.cmdCooldownCache.has(key)) {
      const remaining = (Date.now() - this.client.cmdCooldownCache.get(key)) * 0.001;
      if (remaining > this.cooldown) {
        this.client.cmdCooldownCache.delete(key);
        return 0;
      }
      return remaining;
    }
    return 0;
  }

  applyCooldown(memberId) {
    const key = this.name + "|" + memberId;
    this.client.cmdCooldownCache.set(key, Date.now());
  }

  /**
   * Validates the constructor parameters
   * @param {Client} client - Client to validate
   * @param {CommandData} data - Info to validate
   * @private
   */
  static validateInfo(client, data) {
    if (!client) throw new Error("A client must be specified.");
    if (typeof data !== "object") {
      throw new TypeError("Command data must be an Object.");
    }
    if (typeof data.name !== "string" || data.name !== data.name.toLowerCase()) {
      throw new Error("Command name must be a lowercase string.");
    }
    if (typeof data.description !== "string") {
      throw new TypeError("Command description must be a string.");
    }
    if (data.cooldown && typeof data.cooldown !== "number") {
      throw new TypeError("Command cooldown must be a number");
    }
    if (typeof data.command !== "object") {
      throw new TypeError("Command.command must be an object");
    }
    if (data.command.enabled && typeof data.command.enabled !== "boolean") {
      throw new TypeError("Command.command enabled must be a boolean value");
    }
    if (
      data.command.aliases &&
      (!Array.isArray(data.command.aliases) ||
        data.command.aliases.some((ali) => typeof ali !== "string" || ali !== ali.toLowerCase()))
    ) {
      throw new TypeError("Command.command aliases must be an Array of lowercase strings.");
    }
    if (data.command.usage && typeof data.command.usage !== "string") {
      throw new TypeError("Command.command usage must be a string");
    }
    if (data.command.minArgsCount && typeof data.command.minArgsCount !== "number") {
      throw new TypeError("Command.command minArgsCount must be a number");
    }
    if (data.command.subcommands && !Array.isArray(data.command.subcommands)) {
      throw new TypeError("Command.command subcommands must be an array");
    }
    if (data.command.botPermissions) {
      if (!Array.isArray(data.command.botPermissions)) {
        throw new TypeError("Command.command botPermissions must be an Array of permission key strings.");
      }
      for (const perm of data.command.botPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command clientPermission: ${perm}`);
      }
    }
    if (data.command.userPermissions) {
      if (!Array.isArray(data.command.userPermissions)) {
        throw new TypeError("Command.command userPermissions must be an Array of permission key strings.");
      }
      for (const perm of data.command.userPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
      }
    }
    if (data.command.guildOwnerOnly && typeof data.command.guildOwnerOnly !== "boolean") {
      throw new TypeError("Command.command guildOwnerOnly must be a boolean value");
    }
    if (data.command.botOwnerOnly && typeof data.command.botOwnerOnly !== "boolean") {
      throw new TypeError("Command.command botOwnerOnly must be a boolean value");
    }
    if (data.command.nsfw && typeof data.command.nsfw !== "boolean") {
      throw new TypeError("Command.command nsfw must be a boolean value");
    }
    if (data.command.hidden && typeof data.command.hidden !== "boolean") {
      throw new TypeError("Command.command hidden must be a boolean value");
    }
    if (typeof data.slashCommand !== "object") {
      throw new TypeError("Command.slashCommand must be an object");
    }
    if (data.slashCommand.enabled && typeof data.slashCommand.enabled !== "boolean") {
      throw new TypeError("Command.slashCommand enabled must be a boolean value");
    }
    if (data.slashCommand.ephemeral && typeof data.slashCommand.ephemeral !== "boolean") {
      throw new TypeError("Command.slashCommand ephemeral must be a boolean value");
    }
    if (data.slashCommand.options && !Array.isArray(data.slashCommand.options)) {
      throw new TypeError("Command.slashCommand options must be a array");
    }
  }
}

module.exports = Command;
