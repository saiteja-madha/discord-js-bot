const { Message, TextBasedChannels, User, Guild } = require("discord.js");
const { MessagePayload, MessageOptions } = require("discord.js");

class CommandContext {
  /**
   * @param {Message} message
   * @param {String[]} args
   * @param {String} invoke
   * @param {String} prefix
   */
  constructor(message, args, invoke, prefix) {
    /**
     * @type {Message}
     */
    this.message = message;

    /**
     * @type {Guild}
     */
    this.guild = message.guild;

    /**
     * @type {TextBasedChannels}
     */
    this.channel = message.channel;

    /**
     * @type {User}
     */
    this.author = message.author;

    /**
     * @type {string[]}
     */
    this.args = args;

    /**
     * @type {String}
     */
    this.invoke = invoke;

    /**
     * @type {String}
     */
    this.prefix = prefix;
  }

  /**
   * @param {string | MessagePayload | MessageOptions} message
   */
  async reply(message) {
    return await this.channel.send(message).catch((ex) => console.log(ex));
  }
}

module.exports = CommandContext;
