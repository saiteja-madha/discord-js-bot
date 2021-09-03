const { BotClient } = require("@src/structures");
const { setVoiceChannelName, getMemberStats } = require("@utils/guildUtils");
const { getCounterGuilds, updateBotCount } = require("@schemas/counter-schema");
const { getConfig } = require("@schemas/counter-schema");

/**
 * Updates the counter channel for all the guildId's present in the update queue
 * @param {BotClient} client
 */
async function updateCounterChannels(client) {
  client.counterUpdateQueue.forEach(async (guildId) => {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    try {
      const config = await getConfig(guild.id);
      if (!config) return;

      const all = guild.memberCount;
      const bots = config.bot_count;
      const members = all - bots;

      if (config.tc_channel) {
        const vc = guild.channels.cache.get(config.tc_channel);
        if (vc) {
          const tc = `${config.tc_name} : ${all}`;
          setVoiceChannelName(vc, tc);
        }
      }
      if (config.mc_channel) {
        const vc = guild.channels.cache.get(config.mc_channel);
        if (vc) {
          const mc = `${config.mc_name} : ${members}`;
          setVoiceChannelName(vc, mc);
        }
      }
      if (config.bc_channel) {
        const vc = guild.channels.cache.get(config.bc_channel);
        if (vc) {
          const bc = `${config.bc_name} : ${bots}`;
          setVoiceChannelName(vc, bc);
        }
      }
    } catch (ex) {
      console.log(`Error updating counter channels for guildId: ${guildId}`, ex);
    } finally {
      // remove guildId from cache
      const i = client.counterUpdateQueue.indexOf(guild.id);
      if (i > -1) client.counterUpdateQueue.splice(i, 1);
    }
  });
}

/**
 * Initialize guilds with counter channel enabled
 * @param {BotClient} client
 */
async function init(client) {
  const data = await getCounterGuilds();
  let count = 0;

  data.forEach(async (doc) => {
    const guildId = doc._id;
    if (!client.guilds.cache.has(guildId)) return;

    const guild = client.guilds.cache.get(guildId);
    const stats = await getMemberStats(guild);

    // update bot count in database
    await updateBotCount(guild.id, stats[1], false);

    // schedule for update
    if (!client.counterUpdateQueue.includes(guildId)) client.counterUpdateQueue.push(guildId);
    count += 1;
  });

  console.log(`GUILDS with counter channels: ${count}`);

  // run the scheduler every 10 minutes
  setInterval(() => updateCounterChannels(client), 10 * 60 * 60);
}

module.exports = { init };
