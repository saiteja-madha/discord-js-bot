const chalk = require("chalk"),
  moment = require("moment"),
  simpleLogger = require("simple-node-logger").createRollingFileLogger({
    logDirectory: "./logs",
    fileNamePattern: "roll-<DATE>.log",
    dateFormat: "yyyy.MM.DD",
  });

simpleLogger.setLevel("debug");

/**
 * @param {String} content
 * @param {"log"|"success"|"warn"|"error"|"debug"} level
 * @param {} data
 */
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
      console.log(`[${chalk.cyan(timestamp)}] [${chalk.redBright(level)}] ${content}: ${data}`);
      simpleLogger.error(data ? data : content);
      break;

    case "debug":
      console.log(`[${chalk.cyan(timestamp)}] [${chalk.cyan(level)}] ${content} `);
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
