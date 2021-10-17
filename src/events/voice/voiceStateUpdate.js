const { BotClient } = require("@src/structures");
const { VoiceState } = require("discord.js");

/**
 * @param {BotClient} client
 * @param {VoiceState} oldState
 * @param {VoiceState} newState
 */
module.exports = async (client, oldState, newState) => {
  // if nobody left the channel in question, return.
  if (oldState.channelId !== oldState.guild.me.voice.channelId || newState.channel) return;

  // otherwise, check how many people are in the channel now
  if (!oldState.channel.members.size - 1)
    setTimeout(() => {
      // if 1 (you), wait 1 minute
      if (!oldState.channel.members.size - 1)
        // if there's still 1 member,
        client.musicManager.get(oldState.guild.id)?.destroy();
    }, 1 * 60 * 1000); // (check and disconnect after 1 min)
};
