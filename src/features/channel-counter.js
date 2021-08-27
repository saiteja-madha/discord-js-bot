const { Client, Guild } = require("discord.js");
const db = require("@schemas/counter-schema");
const { setVoiceChannelName, getMemberStats } = require("@utils/guildUtils");

// cache that holds guildId's that needs to be updated
const TO_UPDATE_GUILDS = [];

/**
 * @param {Client} client
 */
async function init(client) {
  // update all previously configured guild counters
  const counterGuilds = await updateCountersOnStartup(client);
  console.log("GUILDS with counter channels: " + counterGuilds);

  // run the scheduler for every 10 minutes to prevent rate limiting
  runScheduler(client, 10);

  client.on("guildMemberAdd", async (member) => {
    if (!member || !member.guild) return;
    const { guild, user } = member;

    const config = await db.getSettings(guild.id);
    if (!config) return;

    // update bot count in database
    if (user.bot) await db.updateBotCount(guild.id, 1, true);
    handleMemberCounter(guild);
  });

  client.on("guildMemberRemove", async (member) => {
    if (member.partial) member = await member.fetch().catch((err) => {});
    const { guild, user } = member;

    if (!guild || !user) return;

    const config = await db.getSettings(guild.id);
    if (!config) return;

    // update bot count in database
    if (user.bot) await db.updateBotCount(guild.id, -1, true);

    handleMemberCounter(guild);
  });
}

/**
 * At startup, update bot count in the database for counter enabled guilds and schedule them for update
 * @param {Client} client
 */
async function updateCountersOnStartup(client) {
  const data = await db.getCounterGuilds();
  let count = 0;

  for (var i = 0; i < data.length; i++) {
    const guildId = data[i]._id;
    if (!client.guilds.cache.has(guildId)) continue;

    const guild = client.guilds.cache.get(guildId);
    const stats = await getMemberStats(guild);

    await db.updateBotCount(guild.id, stats[1], false);
    handleMemberCounter(guild);
    count++;
  }
  return count;
}

/**
 * @param {Guild} guild
 */
function handleMemberCounter(guild) {
  // return if guild is already scheduled for a counter channel update
  if (TO_UPDATE_GUILDS.includes(guild.id)) return;

  // add guildId to cache
  TO_UPDATE_GUILDS.push(guild.id);
}

/**
 * @param {Client} client
 */
function runScheduler(client, minutes) {
  setInterval(async () => {
    for (const guildId of TO_UPDATE_GUILDS) {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) continue;

      try {
        const config = await db.getSettings(guild.id);
        if (!config) continue;

        const all = guild.memberCount;
        const bots = config.bot_count;
        const members = all - bots;

        if (config.tc_channel) {
          let vc = guild.channels.cache.get(config.tc_channel);
          if (vc) {
            let tc = config.tc_name + " : " + all;
            setVoiceChannelName(vc, tc);
          }
        }
        if (config.mc_channel) {
          let vc = guild.channels.cache.get(config.mc_channel);
          if (vc) {
            let mc = config.mc_name + " : " + members;
            setVoiceChannelName(vc, mc);
          }
        }
        if (config.bc_channel) {
          let vc = guild.channels.cache.get(config.bc_channel);
          if (vc) {
            let bc = config.bc_name + " : " + bots;
            setVoiceChannelName(vc, bc);
          }
        }
      } catch (ex) {
        console.log("Error updating counter channels for guildId: " + guildId);
        console.log(ex);
      } finally {
        // remove guildId from cache
        const i = TO_UPDATE_GUILDS.indexOf(guild.id);
        if (i > -1) TO_UPDATE_GUILDS.splice(i, 1);
      }
    }
  }, minutes * 60 * 1000);
}

module.exports = {
  init,
};
