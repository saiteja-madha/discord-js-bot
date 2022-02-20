const { GiveawaysManager } = require("discord-giveaways");
const Model = require("@schemas/Giveaways");
const { EMBED_COLORS } = require("@root/config");

// Explanation at: https://github.com/Androz2091/discord-giveaways/blob/master/examples/custom-databases/mongoose.js
module.exports = class extends GiveawaysManager {
  constructor(client) {
    super(
      client,
      {
        default: {
          botsCanWin: false,
          embedColor: EMBED_COLORS.GIVEAWAYS,
          embedColorEnd: EMBED_COLORS.GIVEAWAYS,
          reaction: "🎁",
        },
      },
      false
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
};
