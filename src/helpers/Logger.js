const config = require("@root/config");
const { EmbedBuilder, WebhookClient } = require("discord.js");
const pino = require("pino");

const webhookLogger = process.env.ERROR_LOGS ? new WebhookClient({ url: process.env.ERROR_LOGS }) : undefined;

const today = new Date();
const pinoLogger = pino.default(
  {
    level: "debug",
  },
  pino.multistream([
    {
      level: "info",
      stream: pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "yyyy-mm-dd HH:mm:ss",
          ignore: "pid,hostname",
          singleLine: false,
          hideObject: true,
          customColors: "info:blue,warn:yellow,error:red",
        },
      }),
    },
    {
      level: "debug",
      stream: pino.destination({
        dest: `${process.cwd()}/logs/combined-${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}.log`,
        sync: true,
      }),
    },
  ])
);

function sendWebhook(content, err) {
  if (!content && !err) return;
  const errString = err?.stack || err;

  const embed = new EmbedBuilder().setColor(config.EMBED_COLORS.ERROR).setAuthor({ name: err?.name || "Error" });

  if (errString)
    embed.setDescription(
      "```js\n" + (errString.length > 4096 ? `${errString.substr(0, 4000)}...` : errString) + "\n```"
    );

  embed.addFields({ name: "Description", value: content || err?.message || "NA" });
  webhookLogger.send({ username: "Logs", embeds: [embed] }).catch((ex) => {});
}

module.exports = class Logger {
  /**
   * @param {string} content
   */
  static success(content) {
    pinoLogger.info(content);
  }

  /**
   * @param {string} content
   */
  static log(content) {
    pinoLogger.info(content);
  }

  /**
   * @param {string} content
   */
  static warn(content) {
    pinoLogger.warn(content);
  }

  /**
   * @param {string} content
   * @param {object} ex
   */
  static error(content, ex) {
    if (ex) {
      pinoLogger.error(ex, `${content}: ${ex?.message}`);
    } else {
      pinoLogger.error(content);
    }
    if (webhookLogger) sendWebhook(content, ex);
  }

  /**
   * @param {string} content
   */
  static debug(content) {
    pinoLogger.debug(content);
  }
};
