const { PermissionResolvable, Client, MessageEmbed } = require("discord.js");
const { permissions, sendMessage } = require("@utils/botUtils");
const CommandContext = require("./command-context");
const { EMOJIS, EMBED_COLORS } = require("@root/config.js");

class Command {
  /**
   * @typedef {Object} ThrottlingOptions
   * @property {number} usages - Maximum number of usages of the command allowed in the time frame.
   * @property {number} duration - Amount of time to count the usages of the command within (in seconds).
   */

  /**
   * @typedef {Object} SubCommand
   * @property {string} trigger - subcommand invoke
   * @property {string} description - subcommand description
   */

  /**
   * @typedef {"ADMIN" | "AUTOMOD" | "ECONOMY" | "FUN" | "IMAGE" | "INFORMATION" | "INVITE" | "MODERATION" | "OWNER" | "SOCIAL" | "TICKET" | "UTILS" } CommandCategory
   */

  /**
   * @typedef {Object} CommandInfo
   * @property {string} name - The name of the command (must be lowercase)
   * @property {string} description - A short description of the command
   * @property {string[]} [aliases] - Alternative names for the command (all must be lowercase)
   * @property {string} [usage=""] - The command usage format string
   * @property {SubCommand[]} [subcommands=[]] - List of subcommands
   * @property {number} [minArgsCount=0] - Minimum number of arguments the command takes (default is 0)
   * @property {CommandCategory} category - The category this command belongs to
   * @property {ThrottlingOptions} [throttling] - Options for throttling usages of the command.
   * @property {string[]} [examples] - Usage examples of the command
   * @property {PermissionResolvable[]} [botPermissions] - Permissions required by the client to use the command.
   * @property {PermissionResolvable[]} [userPermissions] - Permissions required by the user to use the command.
   * @property {boolean} [ownerOnly=false] - Whether or not the command is usable only by an owner
   * @property {boolean} [nsfw=false] - Whether the command is usable only in NSFW channels.
   * @property {boolean} [hidden=false] - Whether the command should be hidden from the help command
   */

  /**
   * @param {Client} client - The discord client
   * @param {CommandInfo} info - The command information
   */
  constructor(client, info) {
    this.constructor.validateInfo(client, info);
    this.client = client;
    this.name = info.name;
    this.description = info.description;
    this.aliases = info.aliases || [];
    this.usage = info.usage || "";
    this.subcommands = info.subcommands || [];
    this.minArgsCount = info.minArgsCount || 0;
    this.category = info.category;
    this.throttling = info.throttling || null;
    this.examples = info.examples || null;
    this.userPermissions = info.userPermissions || [];
    this.botPermissions = info.botPermissions || [];
    this.ownerOnly = info.ownerOnly;
    this.nsfw = info.nsfw;
    this.hidden = info.hidden;
  }

  /**
   * @param {CommandContext} ctx
   */
  async execute(ctx) {
    const { message, channel, guild } = ctx;

    if (!message.guild.members.cache.has(message.author.id) && !message.webhookId) {
      message.member = await message.guild.members.fetch(message.author);
    }

    // Check Arguments
    if (this.minArgsCount > 0 && ctx.args.length < this.minArgsCount) {
      return this.sendUsage(channel, ctx.prefix, ctx.invoke, "Missing arguments");
    }

    // Check guild specific permissions
    if (guild) {
      const { member } = message;
      // Owner only command
      if (this.ownerOnly) {
        if (guild.ownerID != member.id)
          return ctx.reply(`The \`${this.name}\` command can only be used by the guild owner.`);
      }

      // NSFW command
      if (this.nsfw && !channel.nsfw) {
        return;
      }

      if (!channel.permissionsFor(guild.me).has("SEND_MESSAGES")) return;

      // Check user permissions
      if (this.userPermissions.length > 0 && !channel.permissionsFor(member).has(this.userPermissions)) {
        let permissionWord = "permission" + (this.userPermissions.length > 1 ? "s" : "");
        return ctx.reply(
          "You need " + this.parsePermissions(this.userPermissions) + " " + permissionWord + " for this command"
        );
      }

      // Check bot permissions
      if (this.botPermissions.length > 0 && !channel.permissionsFor(guild.me).has(this.botPermissions)) {
        let permissionWord = "permission" + (this.botPermissions.length > 1 ? "s" : "");
        return ctx.reply(
          "I need " + this.parsePermissions(this.botPermissions) + " " + permissionWord + " for this command"
        );
      }
    }

    await this.run(ctx);
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    throw new Error(`${this.constructor.name} doesn't have a run() method.`);
  }

  /**
   * @param {PermissionResolvable[]} perms
   */
  parsePermissions(perms) {
    return perms.map((perm) => "`" + permissions[perm] + "`").join(", ");
  }

  getUsageEmbed(prefix, invoke, title) {
    let desc = "";
    if (this.subcommands.length > 0) {
      this.subcommands.forEach((sub) => (desc += `${EMOJIS.ARROW} \`${invoke} ${sub.trigger}\`: ${sub.description}\n`));
    } else {
      desc += "**Usage:**\n```css\n" + prefix + invoke + " " + this.usage + "```";
    }

    if (this.description !== "") desc += "\n**Help:** " + this.description;

    if (this.throttling) {
      desc += "\n**Cooldown:** " + this.throttling.usages + " " + this.throttling.duration;
    }

    const embed = new MessageEmbed().setColor(EMBED_COLORS.BOT_EMBED).setDescription(desc);
    if (title) embed.setAuthor(title);
    return embed;
  }

  sendUsage(channel, prefix, invoke, title) {
    const embed = this.getUsageEmbed(prefix, invoke, title);
    sendMessage(channel, { embeds: [embed] });
  }

  /**
   * Validates the constructor parameters
   * @param {Client} client - Client to validate
   * @param {CommandInfo} info - Info to validate
   * @private
   */
  static validateInfo(client, info) {
    if (!client) throw new Error("A client must be specified.");
    if (typeof info !== "object") throw new TypeError("Command info must be an Object.");
    if (typeof info.name !== "string") throw new TypeError("Command name must be a string.");
    if (info.name !== info.name.toLowerCase()) throw new Error("Command name must be lowercase.");
    if (typeof info.description !== "string") throw new TypeError("Command description must be a string.");
    if (info.aliases && (!Array.isArray(info.aliases) || info.aliases.some((ali) => typeof ali !== "string"))) {
      throw new TypeError("Command aliases must be an Array of strings.");
    }
    if (info.aliases && info.aliases.some((ali) => ali !== ali.toLowerCase())) {
      throw new RangeError("Command aliases must be lowercase.");
    }
    if (info.usage && typeof info.usage !== "string") throw new TypeError("Command usage must be a string.");
    if (info.minArgsCount && typeof info.minArgsCount !== "number")
      throw new TypeError("Command usage must be a number.");
    if (info.throttling) {
      if (typeof info.throttling !== "object") throw new TypeError("Command throttling must be an Object.");
      if (typeof info.throttling.usages !== "number" || isNaN(info.throttling.usages)) {
        throw new TypeError("Command throttling usages must be a number.");
      }
      if (info.throttling.usages < 1) throw new RangeError("Command throttling usages must be at least 1.");
      if (typeof info.throttling.duration !== "number" || isNaN(info.throttling.duration)) {
        throw new TypeError("Command throttling duration must be a number.");
      }
      if (info.throttling.duration < 1) throw new RangeError("Command throttling duration must be at least 1.");
    }
    if (info.examples && (!Array.isArray(info.examples) || info.examples.some((ex) => typeof ex !== "string"))) {
      throw new TypeError("Command examples must be an Array of strings.");
    }
    if (info.botPermissions) {
      if (!Array.isArray(info.botPermissions)) {
        throw new TypeError("Command botPermissions must be an Array of permission key strings.");
      }
      for (const perm of info.botPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command clientPermission: ${perm}`);
      }
    }
    if (info.userPermissions) {
      if (!Array.isArray(info.userPermissions)) {
        throw new TypeError("Command userPermissions must be an Array of permission key strings.");
      }
      for (const perm of info.userPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
      }
    }
    if (info.ownerOnly && typeof info.ownerOnly !== "boolean")
      throw new TypeError("Command ownerOnly must be an Boolean.");
    if (info.nsfw && typeof info.nsfw !== "boolean") throw new TypeError("Command nsfw must be an Boolean.");
    if (info.hidden && typeof info.hidden !== "boolean") throw new TypeError("Command hidden must be an Boolean.");
  }
}

module.exports = Command;
