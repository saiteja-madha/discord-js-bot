const { GiveawaysManager } = require("discord-giveaways");
const Model = require("@schemas/Giveaways");

class MongooseGiveaways extends GiveawaysManager {
  /**
   * @param {import("@structures/BotClient")} client
   */
  constructor(client) {
    super(
      client,
      {
        default: {
          botsCanWin: false,
          embedColor: client.config.GIVEAWAYS.START_EMBED,
          embedColorEnd: client.config.GIVEAWAYS.END_EMBED,
          reaction: client.config.GIVEAWAYS.REACTION,
        },
      },
      false // do not initialize manager yet
    );
  }

  async getAllGiveaways() {
    return await Model.find().lean().exec();
  }

  async saveGiveaway(messageId, giveawayData) {
    await Model.create(giveawayData);
    return true;
  }

  async editGiveaway(messageId, giveawayData) {
    await Model.updateOne({ messageId }, giveawayData, { omitUndefined: true }).exec();
    return true;
  }

  async deleteGiveaway(messageId) {
    await Model.deleteOne({ messageId }).exec();
    return true;
  }
}

module.exports = (client) => new MongooseGiveaways(client);
