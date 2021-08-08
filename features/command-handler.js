const { Client, Collection } = require("discord.js");
const { Command, CommandContext } = require("@root/command");
const path = require("path");
const fs = require("fs");
const { getSettings } = require("@schemas/settings-schema");
const { PREFIX: DEFAULT_PREFIX } = require("@root/config.json");

const COMMAND_INDEX = new Collection();
const COMMANDS = [];

/**
 * @param {Client} client
 */
function run(client) {
  const readCommands = (dir) => {
    const files = fs.readdirSync(path.join(__appRoot, dir));
    for (const file of files) {
      const stat = fs.lstatSync(path.join(__appRoot, dir, file));
      if (stat.isDirectory()) {
        readCommands(path.join(dir, file));
      } else {
        const cmdClass = require(path.join(__appRoot, dir, file));
        const command = new cmdClass(client);
        addCommand(command);
      }
    }
  };

  readCommands("commands");

  client.on("messageCreate", async (message) => {
    let prefix = DEFAULT_PREFIX;

    if (message.channel.guild) {
      const settings = await getSettings(message.channel.guild.id);
      if (settings?.prefix) prefix = settings?.prefix;
    }

    if (!message.content.startsWith(prefix)) return;

    let args = message.content.replace(`${prefix}`, "").split(/\s+/);
    const invoke = args.shift().toLowerCase();
    const cmd = getCommand(invoke);

    if (cmd) {
      const ctx = new CommandContext(message, args, invoke, prefix);
      cmd.execute(ctx).catch((ex) => console.log(ex));
    }
  });
}

/**
 * @param {Command} cmd
 */
function addCommand(cmd) {
  const index = COMMANDS.length;

  if (COMMAND_INDEX.has(cmd.name)) {
    throw new Error(`Command ${cmd.name} already registered`);
  }

  cmd.aliases.forEach((alias) => {
    if (COMMAND_INDEX.has(alias)) {
      throw new Error(`Alias ${alias} already registered`);
    }
    COMMAND_INDEX.set(alias.toLowerCase(), index);
  });

  COMMAND_INDEX.set(cmd.name.toLowerCase(), index);
  COMMANDS.push(cmd);
}

/**
 * @param {String} invoke
 */
function getCommand(invoke) {
  const index = COMMAND_INDEX.get(invoke.toLowerCase());
  return index != null ? COMMANDS[index] : null;
}

module.exports = {
  run,
  getCommand,
  COMMANDS,
};
