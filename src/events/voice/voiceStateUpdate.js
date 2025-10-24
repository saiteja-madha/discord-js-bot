const { trackVoiceStats } = require("@handlers/stats");
const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder } = require("discord.js")

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').VoiceState} oldState
 * @param {import('discord.js').VoiceState} newState
 */
module.exports = async (client, oldState, newState) => {
  // Track voice stats
  trackVoiceStats(oldState, newState);

  // Erela.js
  if (client.config.MUSIC.ENABLED) {
    const guild = oldState.guild;


    if (oldState.channelId === guild.members.me.voice.channelId && !newState.channel) {

      // check how many people are in the channel now
      if (oldState.channel.members.size === 1) {
        setTimeout(() => {
          // if 1 (you), wait 1 minute
          if (!oldState.channel.members.size - 1) {
            const player = client.musicManager.getPlayer(guild.id);
            if (player) client.musicManager.destroyPlayer(guild.id).then(player.disconnect()); // destroy the player
          }
        }, client.config.MUSIC.IDLE_TIME * 1000);
      }
    }
  }

  // Logging
  const settings = await getSettings(newState.guild);
  if (!settings.logging?.voice) return;
  const logChannel = client.channels.cache.get(settings.logging.voice);

  const embed = new EmbedBuilder().setColor("Green").setTimestamp();

  // Member joins
  if (!oldState.channel && newState.channel) {
    embed
      .setAuthor({ name: "Member Joined Voice Channel" })
      .setThumbnail(newState.member.user.displayAvatarURL())
      .addFields(
        { name: "User", value: newState.member.toString(), inline: true },
        { name: "Channel", value: newState.channel.toString(), inline: true }
      )
      .setFooter({ text: `ID: ${newState.member.id}` });
  }

  // Member moved
  if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
    embed
      .setAuthor({ name: "Member Moved Voice Channel" })
      .setThumbnail(newState.member.user.displayAvatarURL())
      .addFields(
        { name: "User", value: newState.member.toString(), inline: true },
        { name: "Old Channel", value: oldState.channel.toString(), inline: true },
        { name: "New Channel", value: newState.channel.toString(), inline: true }
      )
      .setFooter({ text: `ID: ${newState.member.id}` });
  }

  // Member Left
  if (oldState.channel && !newState.channel) {
    embed
      .setAuthor({ name: "Member Left Voice Channel" })
      .setThumbnail(oldState.member.user.displayAvatarURL())
      .addFields(
        { name: "User", value: oldState.member.toString(), inline: true },
        { name: "Channel", value: oldState.channel.toString(), inline: true }
      )
      .setColor("Red")
      .setFooter({ text: `ID: ${oldState.member.id}` });
  }


  if (embed.data.fields.length) logChannel.send({ embeds: [embed] })
};
