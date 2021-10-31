const { Client, Collection, Intents, WebhookClient, Guild, ApplicationCommand } = require("discord.js");
const path = require("path");
const fs = require("fs");
const Ascii = require("ascii-table");
const mongoose = require("mongoose");
const SlashCommand = require("./SlashCommand");
const BaseContext = require("./BaseContext");
mongoose.plugin(require("mongoose-lean-defaults").default);
const logger = require("../helpers/logger");
const AudioManager = require("./AudioManager");
const { OWNER_IDS } = require("@root/config");

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
      restRequestTimeout: 20000,
    });

    this.config = require("@root/config"); // load the config file

    /**
     * @type {Collection<string,SlashCommand>}
     */
    this.slashCommands = new Collection(); // store slash commands

    /**
     * @type {Collection<string,BaseContext>}
     */
    this.contexts = new Collection(); // store contexts
    this.counterUpdateQueue = []; // store guildId's that needs counter update

    // initialize cache
    this.cmdCooldownCache = new Collection(); // store message cooldowns for commands
    this.ctxCooldownCache = new Collection(); // store message cooldowns for commands
    this.xpCooldownCache = new Collection(); // store message cooldowns for xp
    this.inviteCache = new Collection(); // store invite data for invite tracking
    this.antiScamCache = new Collection(); // store message data for anti_scam feature

    // initialize webhook for sending guild join/leave details
    this.joinLeaveWebhook = process.env.JOIN_LEAVE_LOGS
      ? new WebhookClient({ url: process.env.JOIN_LEAVE_LOGS })
      : undefined;

    // Music Player
    this.musicManager = new AudioManager(this);

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
   * Load all events from the specified directory
   * @param {string} directory directory containing the event files
   */
  loadEvents(directory) {
    this.logger.log(`Loading events...`);
    const table = new Ascii().setHeading("EVENT", "Status");
    let events = 0;

    this.getAbsoluteFilePaths(directory).forEach((filePath) => {
      const file = filePath.replace(/^.*[\\/]/, "");
      try {
        const eventName = file.split(".")[0];
        const event = require(filePath);

        // music events
        if (filePath.split("\\").at(-2) === "music") {
          this.musicManager.on(eventName, event.bind(null, this));
        }

        // bot events
        this.on(eventName, event.bind(null, this));
        delete require.cache[require.resolve(filePath)];
        table.addRow(file, "✓");
      } catch (ex) {
        table.addRow(file, "✕");
        this.logger.error("readEvent", ex);
      } finally {
        events += 1;
      }
    });

    console.log(table.toString());
    this.logger.success(`Loaded ${events} events`);
  }

  /**
   * Load all slash commands from the specified directory
   * @param {string} directory
   */
  loadSlashCommands(directory) {
    this.logger.log(`Loading slash commands...`);
    this.getAbsoluteFilePaths(directory).forEach((filePath) => {
      const file = filePath.replace(/^.*[\\/]/, "");
      try {
        const cmdClass = require(filePath);
        if (!(cmdClass.prototype instanceof SlashCommand)) return;
        const cmd = new cmdClass(this);
        if (!cmd.enabled) return this.logger.debug(`Skipping command ${cmd.name}. Disabled!`);
        if (this.slashCommands.has(cmd.name)) throw new Error(`Slash command already exists with that name`);
        this.slashCommands.set(cmd.name, cmd);
      } catch (ex) {
        this.logger.error(`Slash Command: Failed to load ${file} Reason: ${ex.message}`);
      }
    });
    if (this.slashCommands.size > 100) throw new Error("A maximum of 100 SLASH commands can be enabled");
    this.logger.success(`Loaded ${this.slashCommands.size} slash commands`);
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
        const ctx = new ctxClass(this);
        if (!ctx.enabled) return this.logger.debug(`Skipping context ${ctx.name}. Disabled!`);
        if (this.contexts.has(ctx.name)) throw new Error(`Context already exists with that name`);
        this.contexts.set(ctx.name, ctx);
      } catch (ex) {
        this.logger.error(`Context: Failed to load ${file} Reason: ${ex.message}`);
      }
    });
    const userContexts = this.contexts.filter((ctx) => ctx.type === "USER").size;
    const messageContexts = this.contexts.filter((ctx) => ctx.type === "MESSAGE").size;

    if (userContexts > 3) throw new Error("A maximum of 3 USER contexts can be enabled");
    if (messageContexts > 3) throw new Error("A maximum of 3 MESSAGE contexts can be enabled");

    this.logger.success(`Loaded ${userContexts} USER contexts`);
    this.logger.success(`Loaded ${messageContexts} MESSAGE contexts`);
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
   * Register Interactions Globally
   */
  async registerGlobalInteractions() {
    if (this.config.TEST_GUILD) {
      return this.logger.log("Testing Mode: Skipping Global Commands");
    }

    const toRegister = [];

    // filter global commands
    const globalCmds = this.slashCommands.filter((cmd) => cmd.userPermissions.length === 0);
    globalCmds
      .map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
        type: "CHAT_INPUT",
        options: cmd.options,
        defaultPermission: cmd.category === "OWNER" ? false : true,
      }))
      .forEach((s) => toRegister.push(s));

    // add contexts
    this.contexts
      .filter((cmd) => cmd.enabled)
      .map((cmd) => ({
        name: cmd.name,
        type: cmd.type,
      }))
      .forEach((c) => toRegister.push(c));

    const applicationCommands = await this.application.commands.set(toRegister);
    this.logger.success("Successfully registered global interactions");

    // Add owner permissions
    if (OWNER_IDS.length > 0) {
      const permissions = OWNER_IDS.map((id) => ({
        id: id,
        type: "USER",
        permission: true,
      }));

      const fullPermissions = applicationCommands.reduce((acc, appCmd) => {
        if (globalCmds.find((c) => c.name === appCmd.name && c.category === "OWNER")) {
          return [
            ...acc,
            {
              id: appCmd.id,
              permissions: permissions,
            },
          ];
        } else return acc;
      }, []);

      await this.application.commands.permissions.set({ fullPermissions });
      this.logger.log("Syncing global slash command owner permissions");
    }
  }

  /**
   * Register guild specific slash commands
   * @param {Guild} guild
   */
  async registerGuildInteractions(guild) {
    if (!guild) throw new Error("No guild provided");

    // if testing, only register in test guild
    if (this.config.TEST_GUILD && this.config.TEST_GUILD !== guild.id) return;

    // filter guild commands
    const toRegister = Array.from(
      this.slashCommands
        .filter((cmd) => this.config.TEST_GUILD || cmd.userPermissions.length > 0)
        .map((cmd) => ({
          name: cmd.name,
          description: cmd.description,
          type: "CHAT_INPUT",
          options: cmd.options,
          defaultPermission: cmd.userPermissions.length > 0 ? false : true,
        }))
    );

    const applicationCommands = await guild.commands.set(toRegister);
    this.syncSlashPermissions(guild, applicationCommands);
  }

  /**
   * This function updates slash command permissions
   * @param {Guild} guild
   * @param {Collection<string, ApplicationCommand<{}>>} [applicationCommands]
   */
  async syncSlashPermissions(guild, applicationCommands) {
    if (!guild) throw new Error("No guild provided");
    if (!applicationCommands) applicationCommands = await guild.commands.fetch();

    const guildCommands = this.slashCommands.filter((cmd) => cmd.userPermissions.length > 0);

    // Get guild roles that have the permissions mentioned in slash command
    const getRoles = (cmdName) => {
      const permissions = guildCommands.find((x) => x.name === cmdName)?.userPermissions;
      if (!permissions || permissions.length === 0) return null;
      return guild.roles.cache.filter((x) => x.permissions.has(permissions, false) && !x.managed);
    };

    const fullPermissions = applicationCommands.reduce((acc, appCmd) => {
      const roles = getRoles(appCmd.name);
      if (!roles) return acc;

      const permissions = roles.reduce((a, role) => {
        return [
          ...a,
          {
            id: role.id,
            type: "ROLE",
            permission: true,
          },
        ];
      }, []);

      return [
        ...acc,
        {
          id: appCmd.id,
          permissions: permissions,
        },
      ];
    }, []);

    await guild.commands.permissions.set({ fullPermissions });
    this.logger.debug(`Syncing slash command permissions in ${guild.id}`);
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
