const { MUSIC } = require("@root/config");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').VoiceState} oldState
 * @param {import('discord.js').VoiceState} newState
 */
module.exports = async (client, oldState, newState) => {
  const guild = oldState.guild;

  // if nobody left the channel in question, return.
  if (oldState.channelId !== guild.me.voice.channelId || newState.channel) return;

  // otherwise, check how many people are in the channel now
  if (oldState.channel.members.size === 1) {
    setTimeout(() => {
      // if 1 (you), wait 1 minute
      if (!oldState.channel.members.size - 1)
        // if there's still 1 member,
        client.musicManager.get(guild.id) && client.musicManager.get(guild.id).destroy();
    }, MUSIC.IDLE_TIME * 1000);
  }
};
