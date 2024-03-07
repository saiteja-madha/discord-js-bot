const { LoopType } = require("@lavaclient/queue");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function pauseButton(client, interaction) {
  await interaction.deferUpdate();
  const player = client.musicManager.getPlayer(interaction.guildId);

  if (!interaction.member.voice.channel) {
    return interaction.channel.send("🚫 No music is being played!");
  };
  if (!interaction.guild.members.me.voice.channel) {
    return interaction.channel.send("🚫 You need to join my voice channel.");
  };
  if (interaction.guild.members.me.voice.channel && !interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
    return interaction.channel.send("🚫 You're not in the same voice channel.");
  };

  if (!player.paused) {
    await player.pause();
    return interaction.channel.send("⏸️ Paused the music player.");
  };
  if (player.paused) {
    await player.resume();
    return interaction.channel.send("▶️ Resumed the music player");
  };
};

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function skipButton(client, interaction) {
  await interaction.deferUpdate();
  const player = client.musicManager.getPlayer(interaction.guildId);

  if (!interaction.member.voice.channel) {
    return interaction.channel.send("🚫 No music is being played!");
  };
  if (!interaction.guild.members.me.voice.channel) {
    return interaction.channel.send("🚫 You need to join my voice channel.");
  };
  if (interaction.guild.members.me.voice.channel && !interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
    return interaction.channel.send("🚫 You're not in the same voice channel.");
  };
  
  const { title } = player.queue.current;
  return player.queue.next() ? `⏯️ ${title} was skipped.` : "⏯️ There is no song to skip.";
};

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function stopButton(client, interaction) {
  await interaction.deferUpdate();
  const player = client.musicManager.getPlayer(interaction.guildId);

  if (!interaction.member.voice.channel) {
    return interaction.channel.send("🚫 No music is being played!");
  };
  if (!interaction.guild.members.me.voice.channel) {
    return interaction.channel.send("🚫 You need to join my voice channel.");
  };
  if (interaction.guild.members.me.voice.channel && !interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
    return interaction.channel.send("🚫 You're not in the same voice channel.");
  };

  if (player.playing) {
    player.disconnect();
    await client.musicManager.destroyPlayer(interaction.guildId);
    return interaction.channel.send("🎶 The music player is stopped and queue has been cleared");
  };
};

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function loopButton(client, interaction) {
  await interaction.deferUpdate();
  const player = client.musicManager.getPlayer(interaction.guildId);

  if (!interaction.member.voice.channel) {
    return interaction.channel.send("🚫 No music is being played!");
  };
  if (!interaction.guild.members.me.voice.channel) {
    return interaction.channel.send("🚫 You need to join my voice channel.");
  };
  if (interaction.guild.members.me.voice.channel && !interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
    return interaction.channel.send("🚫 You're not in the same voice channel.");
  };

  // Looping Track
  if (player.queue.loop.type === 0) {
    player.queue.setLoop(LoopType.Song);
    return interaction.channel.send("Loop mode is set to `track`");
  };
  // Looping Queue
  if (player.queue.loop.type === 2) {
    player.queue.setLoop(LoopType.Queue);
    return interaction.channel.send("Loop mode is set to `queue`");
  };
  // Turn OFF Looping
  if (player.queue.loop.type === 1) {
    player.queue.setLoop(LoopType.None);
    return interaction.channel.send("Loop mode is set to `none`");
  };
};

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function shuffleButton(client, interaction) {
  await interaction.deferUpdate();
  const player = client.musicManager.getPlayer(interaction.guildId);

  if (!interaction.member.voice.channel) {
    return interaction.channel.send("🚫 No music is being played!");
  };
  if (!interaction.guild.members.me.voice.channel) {
    return interaction.channel.send("🚫 You need to join my voice channel.");
  };
  if (interaction.guild.members.me.voice.channel && !interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
    return interaction.channel.send("🚫 You're not in the same voice channel.");
  };

  player.queue.shuffle();
  return interaction.channel.send("🎶 Queue has been shuffled");
};

module.exports = {
  pauseButton,
  skipButton,
  stopButton,
  loopButton,
  shuffleButton,
};
