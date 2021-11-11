const { Client, Collection, Intents, WebhookClient } = require("discord.js");
const path = require("path");
const fs = require("fs");
const { table } = require("table");
const mongoose = require("mongoose");
mongoose.plugin(require("mongoose-lean-defaults").default);
const logger = require("../helpers/logger");
const MusicManager = require("./MusicManager");
const Command = require("./Command");
const BaseContext = require("./BaseContext");

module.exports = class BotClient extends Client {
  constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
      partials: ["USER", "MESSAGE", "REACTION"],
      allowedMentions: {
        repliedUser: false,
      },
      restRequestTimeout: 20000,
    });

    this.config = require("@root/config"); // load the config file

    /**
     * @type {Collection<string, Command>}
     */
    this.commands = new Collection(); // store message commands

    /**
     * @type {Collection<string, Command>}
     */
    this.slashCommands = new Collection(); // store slash commands
    this.contextMenus = new Collection(); // store contextMenus
    this.counterUpdateQueue = []; // store guildId's that needs counter update

    // initialize cache
    this.cmdCooldownCache = new Collection(); // store message cooldowns for commands
    this.xpCooldownCache = new Collection(); // store message cooldowns for xp
    this.inviteCache = new Collection(); // store invite data for invite tracking
    this.antiScamCache = new Collection(); // store message data for anti_scam feature

    // initialize webhook for sending guild join/leave details
    this.joinLeaveWebhook = process.env.JOIN_LEAVE_LOGS
      ? new WebhookClient({ url: process.env.JOIN_LEAVE_LOGS })
      : undefined;

    // Music Player
    this.musicManager = new MusicManager(this);

    // Logger
    this.logger = logger;
  }

  /**
   * Initialize mongoose connection and keep it alive
   */
  async initializeMongoose() {
    this.logger.log(`Connecting to MongoDb...`);

    await mongoose.connect(process.env.MONGO_CONNECTION, {
      keepAlive: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    this.logger.success("Mongoose: Database connection established");
  }

  /**
   * @param {string} directory
   * @private
   */
  getAbsoluteFilePaths(directory) {
    const filePaths = [];
    const readCommands = (dir) => {
      const files = fs.readdirSync(path.join(__appRoot, dir));
      files.forEach((file) => {
        const stat = fs.lstatSync(path.join(__appRoot, dir, file));
        if (stat.isDirectory()) {
          readCommands(path.join(dir, file));
        } else {
          const extension = file.split(".").at(-1);
          if (extension !== "js") return;
          const filePath = path.join(__appRoot, dir, file);
          filePaths.push(filePath);
        }
      });
    };
    readCommands(directory);
    return filePaths;
  }

  /**
   * Load all events from the specified directory
   * @param {string} directory directory containing the event files
   */
  loadEvents(directory) {
    this.logger.log(`Loading events...`);
    let success = 0;
    let failed = 0;
    const clientEvents = [];
    const musicEvents = [];

    this.getAbsoluteFilePaths(directory).forEach((filePath) => {
      const file = filePath.replace(/^.*[\\/]/, "");
      try {
        const eventName = file.split(".")[0];
        const event = require(filePath);

        // music events
        if (filePath.split("\\").at(-2) === "music") {
          this.musicManager.on(eventName, event.bind(null, this));
          musicEvents.push([file, "✓"]);
        }

        // bot events
        else {
          this.on(eventName, event.bind(null, this));
          clientEvents.push([file, "✓"]);
        }

        delete require.cache[require.resolve(filePath)];
        success += 1;
      } catch (ex) {
        failed += 1;
        this.logger.error(`loadEvent - ${file}`, ex);
      }
    });

    console.log(
      table(clientEvents, {
        header: {
          alignment: "center",
          content: "Client Events",
        },
        singleLine: true,
        columns: [{ width: 25 }, { width: 5, alignment: "center" }],
      })
    );

    console.log(
      table(musicEvents, {
        header: {
          alignment: "center",
          content: "Music Events",
        },
        singleLine: true,
        columns: [{ width: 25 }, { width: 5, alignment: "center" }],
      })
    );

    this.logger.log(`Loaded ${success + failed} events. Success (${success}) Failed (${failed})`);
  }

  /**
   * Load all commands from the specified directory
   * @param {string} directory
   */
  loadCommands(directory) {
    this.logger.log(`Loading commands...`);
    this.getAbsoluteFilePaths(directory).forEach((filePath) => {
      const file = filePath.replace(/^.*[\\/]/, "");
      try {
        const cmdClass = require(filePath);
        if (!(cmdClass.prototype instanceof Command)) return;
        const cmd = new cmdClass(this);
        if (cmd.command?.enabled) {
          if (this.commands.has(cmd.name)) throw new Error(`Command ${cmd.name} already registered`);
          this.commands.set(cmd.name, cmd);
        } else {
          this.logger.debug(`Skipping command ${cmd.name}. Disabled!`);
        }
        if (cmd.slashCommand?.enabled) {
          if (this.slashCommands.has(cmd.name)) throw new Error(`Slash Command ${cmd.name} already registered`);
          this.slashCommands.set(cmd.name, cmd);
        } else {
          this.logger.debug(`Skipping slash command ${cmd.name}. Disabled!`);
        }
      } catch (ex) {
        this.logger.error(`Failed to load ${file} Reason: ${ex.message}`);
      }
    });
    this.logger.success(`Loaded ${this.commands.size} commands`);
    this.logger.success(`Loaded ${this.slashCommands.size} slash commands`);
    if (this.slashCommands.size > 100) throw new Error("A maximum of 100 slash commands can be enabled");
  }

  /**
   * Load all contexts from the specified directory
   * @param {string} directory
   */
  loadContexts(directory) {
    this.logger.log(`Loading contexts...`);
    this.getAbsoluteFilePaths(directory).forEach((filePath) => {
      const file = filePath.replace(/^.*[\\/]/, "");
      try {
        const ctxClass = require(filePath);
        if (!(ctxClass.prototype instanceof BaseContext)) return;
        const ctx = new ctxClass(this);
        if (!ctx.enabled) return this.logger.debug(`Skipping context ${ctx.name}. Disabled!`);
        if (this.contextMenus.has(ctx.name)) throw new Error(`Context already exists with that name`);
        this.contextMenus.set(ctx.name, ctx);
      } catch (ex) {
        this.logger.error(`Context: Failed to load ${file} Reason: ${ex.message}`);
      }
    });
    const userContexts = this.contextMenus.filter((ctx) => ctx.type === "USER").size;
    const messageContexts = this.contextMenus.filter((ctx) => ctx.type === "MESSAGE").size;

    if (userContexts > 3) throw new Error("A maximum of 3 USER contexts can be enabled");
    if (messageContexts > 3) throw new Error("A maximum of 3 MESSAGE contexts can be enabled");

    this.logger.success(`Loaded ${userContexts} USER contexts`);
    this.logger.success(`Loaded ${messageContexts} MESSAGE contexts`);
  }

  /**
   * Register slash command on startup
   * @param {string} [guildId]
   */
  async registerInteractions(guildId) {
    const toRegister = [];

    // filter slash commands
    if (this.config.INTERACTIONS.SLASH) {
      this.commands
        .filter((cmd) => cmd.slashCommand?.enabled)
        .map((cmd) => ({
          name: cmd.name,
          description: cmd.description,
          type: "CHAT_INPUT",
          options: cmd.slashCommand.options,
        }))
        .forEach((s) => toRegister.push(s));
    }

    // filter contexts
    if (this.config.INTERACTIONS.CONTEXT) {
      this.commands
        .filter((cmd) => cmd.contextMenu?.enabled)
        .map((cmd) => ({
          name: cmd.name,
          type: cmd.contextMenu.type,
        }))
        .forEach((c) => toRegister.push(c));
    }

    // Register GLobally
    if (!guildId) {
      await this.application.commands.set(toRegister);
    }

    // Register for a specific guild
    else if (guildId && typeof guildId === "string") {
      const guild = this.guilds.cache.get(guildId);
      if (!guild) throw new Error(`No guilds found matching ${guildId}`);
      await guild.commands.set(toRegister);
    }

    // Throw an error
    else {
      throw new Error(`Did you provide a valid guildId to register slash commands`);
    }

    this.logger.success("Successfully registered slash commands");
  }

  /**
   * Get bot's invite
   */
  getInvite() {
    return this.generateInvite({
      scopes: ["bot", "applications.commands"],
      permissions: [
        "ADD_REACTIONS",
        "ATTACH_FILES",
        "BAN_MEMBERS",
        "CHANGE_NICKNAME",
        "CONNECT",
        "DEAFEN_MEMBERS",
        "EMBED_LINKS",
        "KICK_MEMBERS",
        "MANAGE_CHANNELS",
        "MANAGE_GUILD",
        "MANAGE_MESSAGES",
        "MANAGE_NICKNAMES",
        "MANAGE_ROLES",
        "MOVE_MEMBERS",
        "MUTE_MEMBERS",
        "PRIORITY_SPEAKER",
        "READ_MESSAGE_HISTORY",
        "SEND_MESSAGES",
        "SEND_MESSAGES_IN_THREADS",
        "SPEAK",
        "VIEW_CHANNEL",
      ],
    });
  }
};
