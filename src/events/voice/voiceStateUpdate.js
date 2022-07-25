const { trackVoiceStats } = require("@handlers/stats");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').VoiceState} oldState
 * @param {import('discord.js').VoiceState} newState
 */
module.exports = async (client, oldState, newState) => {
  // Track voice stats
  trackVoiceStats(oldState, newState);

  // Erela.js
  if (client.config.ERELA_JS.ENABLED) {
    const guild = oldState.guild;

    // if nobody left the channel in question, return.
    if (oldState.channelId !== guild.members.me.voice.channelId || newState.channel) return;

    // otherwise, check how many people are in the channel now
    if (oldState.channel.members.size === 1) {
      setTimeout(() => {
        // if 1 (you), wait 1 minute
        if (!oldState.channel.members.size - 1)
          // if there's still 1 member,
          client.erelaManager.get(guild.id) && client.erelaManager.get(guild.id).destroy();
      }, client.config.ERELA_JS.IDLE_TIME * 1000);
    }
  }
};
