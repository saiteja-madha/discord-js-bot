const { Client, Collection, Intents, WebhookClient } = require("discord.js");
const path = require("path");
const fs = require("fs");
const Ascii = require("ascii-table");
const mongoose = require("mongoose");
const Command = require("./command");
mongoose.plugin(require("mongoose-lean-defaults").default);

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
    this.counterUpdateQueue = []; // store guildId's that needs counter update

    // initialize cache
    this.messageCooldownCache = new Collection(); // store message cooldowns
    this.xpCooldownCache = new Collection(); // store (guildId|memberID, Date) pair
    this.inviteCache = new Collection(); // store (guildId, Map<inviteData>) pair

    // initialize webhook for sending guild join/leave details
    this.joinLeaveWebhook = this.config.JOIN_LEAVE_WEBHOOK
      ? new WebhookClient({ url: this.config.JOIN_LEAVE_WEBHOOK })
      : undefined;
  }

  /**
   * Initialize mongoose connection and keep it alive
   */
  async initializeMongoose() {
    await mongoose.connect(this.config.MONGO_CONNECTION, {
      keepAlive: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    console.log("Database connection established");
  }

  /**
   * Load all events from the specified directory
   * @param {string} directory directory containing the event files
   */
  loadEvents(directory) {
    const table = new Ascii().setHeading("EVENT", "Status");

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
            console.log(ex);
          }
        }
      });
    };
    readEvents(directory);
    console.log(table.toString());
  }

  /**
   * Register command file in the client
   * @param {Command} cmd
   */
  loadCommand(cmd) {
    const index = this.commands.length;
    if (cmd.command.enabled) {
      if (this.commandIndex.has(cmd.name)) throw new Error(`Command ${cmd.name} already registered`);
      cmd.command.aliases.forEach((alias) => {
        if (this.commandIndex.has(alias)) throw new Error(`Alias ${alias} already registered`);
        this.commandIndex.set(alias.toLowerCase(), index);
      });
      this.commandIndex.set(cmd.name.toLowerCase(), index);
      this.commands.push(cmd);
    }

    if (cmd.slashCommand.enabled) {
      if (this.slashCommands.has(cmd.name)) throw new Error(`Slash Command ${cmd.name} already registered`);
      this.slashCommands.set(cmd.name, cmd);
    }
  }

  /**
   * Load all commands from the specified directory
   * @param {string} directory
   */
  loadCommands(directory) {
    const readCommands = (dir) => {
      const files = fs.readdirSync(path.join(__appRoot, dir));
      files.forEach((file) => {
        const stat = fs.lstatSync(path.join(__appRoot, dir, file));
        if (stat.isDirectory()) {
          readCommands(path.join(dir, file));
        } else {
          const CommandClass = require(path.join(__appRoot, dir, file));
          const command = new CommandClass(this);
          this.loadCommand(command);
        }
      });
    };
    readCommands(directory);
    console.log(`Loaded ${this.commands.length} commands`);
    console.log(`Loaded ${this.slashCommands.size} slash commands`);
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
  async registerSlashCommands(guildId) {
    const toRegister = this.commands
      .filter((cmd) => cmd.slashCommand.enabled)
      .map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
        type: "CHAT_INPUT",
        options: cmd.slashCommand.options,
      }));

    if (!guildId) {
      await this.application.commands.set(toRegister);
    }

    // Register for a specific guild
    else if (guildId && typeof guildId === "string") {
      const guild = this.guilds.cache.get(guildId);
      if (!guild) throw new Error(`No guilds found matching ${guildId}`);
      await guild.commands.set(toRegister);
    }

    console.log("Successfully registered slash commands");
  }

  /**
   * Unregister the specified slash command
   * @param {string} command - name of the slash command to be deleted
   * @param {string} [guildId] - guild in which the command should be deleted
   */
  async unRegisterSlashCommand(command, guildId) {
    if (guildId && typeof guildId === "string") {
      const guild = this.guilds.cache.get(guildId);
      if (!guild) throw new Error(`No guilds found matching ${guildId}`);

      let existing = await guild.commands.fetch();
      let found = existing.find((cmd) => cmd.name === command);

      if (!found) throw new Error(`No slash command found matching ${command} in guild ${guild.name}`);
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
