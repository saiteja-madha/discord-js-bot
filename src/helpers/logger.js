const { MessageEmbed, WebhookClient } = require("discord.js"),
  chalk = require("chalk"),
  moment = require("moment"),
  nodeLogger = require("simple-node-logger"),
  config = require("@root/config");

const simpleLogger = nodeLogger.createRollingFileLogger({
  logDirectory: "./logs",
  fileNamePattern: "roll-<DATE>.log",
  dateFormat: "yyyy.MM.DD",
});

simpleLogger.setLevel("debug");

const errorWebhook = process.env.ERROR_LOGS ? new WebhookClient({ url: process.env.ERROR_LOGS }) : undefined;

const sendWebhook = (content, err) => {
  const embed = new MessageEmbed()
    .setColor(config.EMBED_COLORS.ERROR)
    .setAuthor(err?.name || "Error")
    .setDescription("```js\n" + err?.stack || err + "```");

  if (err?.description) embed.addField("Description", content);
  if (err?.message) embed.addField("Message", err?.message);

  errorWebhook.send({
    username: "Logs",
    embeds: [embed],
  });
};

const sendLogs = (level, content, data) => {
  const timestamp = `${moment().format("yyyy-MM-DD HH:mm:ss:SSS")}`;

  switch (level) {
    case "log":
      console.log(`[${chalk.cyan(timestamp)}] [${chalk.blueBright("info")}] ${content} `);
      simpleLogger.info(content);
      break;

    case "success":
      console.log(`[${chalk.cyan(timestamp)}] [${chalk.green(level)}] ${content} `);
      simpleLogger.info(content);
      break;

    case "warn":
      console.log(`[${chalk.cyan(timestamp)}] [${chalk.yellow("warning")}] ${content} `);
      simpleLogger.warn(content);
      break;

    case "error":
      console.log(`[${chalk.cyan(timestamp)}] [${chalk.redBright(level)}] ${content} ${data ? ": " + data : ""}`);
      simpleLogger.error(data ? data : content);
      if (errorWebhook) sendWebhook(content, data);
      break;

    case "debug":
      simpleLogger.debug(content);
      break;

    default:
      break;
  }
};

exports.success = (content) => sendLogs("success", content);
exports.warn = (content) => sendLogs("warn", content);
exports.error = (content, ex) => sendLogs("error", content, ex);
exports.debug = (content) => sendLogs("debug", content);
exports.log = (content) => sendLogs("log", content);
