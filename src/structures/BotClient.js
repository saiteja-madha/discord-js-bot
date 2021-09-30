const { Client, Collection, Intents, WebhookClient } = require("discord.js");
const path = require("path");
const fs = require("fs");
const Ascii = require("ascii-table");
const mongoose = require("mongoose");
const Command = require("./Command");
mongoose.plugin(require("mongoose-lean-defaults").default);
const logger = require("../helpers/logger");
const { Manager } = require("erela.js");

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
    });

    this.config = require("@root/config"); // load the config file

    /**
     * @type {Command[]}
     */
    this.commands = []; // store actual command
    this.commandIndex = new Collection(); // store (alias, arrayIndex) pair
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
    this.musicManager = new Manager({
      nodes: this.config.MUSIC.NODES,
      send: (id, payload) => {
        const guild = this.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      },
      autoPlay: true,
    });
    this.on("raw", (d) => this.musicManager.updateVoiceState(d));

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

    const readEvents = (dir) => {
      const files = fs.readdirSync(path.join(__appRoot, dir));
      files.forEach((file) => {
        const stat = fs.lstatSync(path.join(__appRoot, dir, file));
        if (stat.isDirectory()) {
          readEvents(path.join(dir, file));
        } else {
          const eventName = file.split(".")[0];
          const event = require(path.join(__appRoot, dir, file));
          try {
            this.on(eventName, event.bind(null, this));
            delete require.cache[require.resolve(path.join(__appRoot, dir, file))];
            table.addRow(file, this.config.EMOJIS.TICK);
          } catch (ex) {
            table.addRow(file, this.config.EMOJIS.X_MARK);
            this.logger.error("readEvent", ex);
          } finally {
            events += 1;
          }
        }
      });
    };
    readEvents(directory);
    console.log(table.toString());
    this.logger.success(`Loaded ${events} events`);
  }

  /**
   * Register command file in the client
   * @param {Command} cmd
   */
  loadCommand(cmd) {
    const index = this.commands.length;
    if (cmd.command.enabled) {
      if (this.commandIndex.has(cmd.name)) {
        throw new Error(`Command ${cmd.name} already registered`);
      }
      cmd.command.aliases.forEach((alias) => {
        if (this.commandIndex.has(alias)) throw new Error(`Alias ${alias} already registered`);
        this.commandIndex.set(alias.toLowerCase(), index);
      });
      this.commandIndex.set(cmd.name.toLowerCase(), index);
      this.commands.push(cmd);
    }

    if (cmd.slashCommand?.enabled) {
      if (this.slashCommands.has(cmd.name)) {
        throw new Error(`Slash Command ${cmd.name} already registered`);
      }
      this.slashCommands.set(cmd.name, cmd);
    }

    if (cmd.contextMenu?.enabled) {
      if (this.contextMenus.has(cmd.name)) {
        throw new Error(`Context Menu ${cmd.name} already registered`);
      }
      this.contextMenus.set(cmd.name, cmd);
    }
  }

  /**
   * Load all commands from the specified directory
   * @param {string} directory
   */
  loadCommands(directory) {
    this.logger.log(`Loading commands...`);
    const readCommands = (dir) => {
      const files = fs.readdirSync(path.join(__appRoot, dir));
      files.forEach((file) => {
        const stat = fs.lstatSync(path.join(__appRoot, dir, file));
        if (stat.isDirectory()) {
          readCommands(path.join(dir, file));
        } else {
          const CommandClass = require(path.join(__appRoot, dir, file));
          const command = new CommandClass(this);
          try {
            this.loadCommand(command);
          } catch (ex) {
            this.logger.error(`Failed to load ${command.name}`);
          }
        }
      });
    };
    readCommands(directory);
    this.logger.success(`Loaded ${this.commands.length} commands`);
    this.logger.success(`Loaded ${this.slashCommands.size} slash commands`);
    this.logger.success(`Loaded ${this.contextMenus.size} contexts`);
  }

  /**
   * Find command matching the invoke
   * @param {string} invoke
   * @returns {Command|undefined}
   */
  getCommand(invoke) {
    const index = this.commandIndex.get(invoke.toLowerCase());
    return index !== undefined ? this.commands[index] : undefined;
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
   * Unregister the specified slash command
   * @param {string} command - name of the slash command to be deleted
   * @param {string} [guildId] - guild in which the command should be deleted
   */
  async unRegisterInteraction(command, guildId) {
    if (guildId && typeof guildId === "string") {
      const guild = this.guilds.cache.get(guildId);
      if (!guild) throw new Error(`No guilds found matching ${guildId}`);

      let existing = await guild.commands.fetch();
      let found = existing.find((cmd) => cmd.name === command);

      if (!found) {
        throw new Error(`No slash command found matching ${command} in guild ${guild.name}`);
      }
      await found.delete();
    }
    if (!guildId) {
      let existing = await this.application.commands.fetch();
      let found = existing.find((cmd) => cmd.name === command);
      if (!found) throw new Error(`No global slash command found matching ${command}`);
      await found.delete();
    }
  }
};
