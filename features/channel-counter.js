const { Client, Guild } = require("discord.js");
const db = require("@schemas/counter-schema");
const { setVoiceChannelName, getMemberStats } = require("@utils/guildUtils");

const COUNTER_PROGRESS = [];

/**
 * @param {Client} client
 */
async function run(client) {
  // update all previously configured guild counters
  const counterGuilds = await updateCountersOnStartup(client);
  console.log("GUILDS with counter channels: " + counterGuilds);

  client.on("guildMemberAdd", async (member) => {
    if (!member || !member.guild) return;
    const { guild, user } = member;

    const config = await db.getSettings(guild.id);
    if (!config) return;

    // update bot count in database
    if (user.bot) await db.updateBotCount(guild.id, 1, true);
    await handleMemberCounter(guild);
  });

  client.on("guildMemberRemove", async (member) => {
    if (member.partial) member = await member.fetch().catch((err) => {});
    const { guild, user } = member;

    if (!guild || !user) return;

    // update bot count in database
    if (user.bot) await db.updateBotCount(guild.id, -1, true);
    await handleMemberCounter(guild);
  });
}

/**
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
async function handleMemberCounter(guild) {
  // return if guild scheduled for a counter channel update
  if (COUNTER_PROGRESS.includes(guild.id)) return;

  // add guildId to cache
  COUNTER_PROGRESS.push(guild.id);

  setTimeout(async () => {
    const config = await db.getSettings(guild.id);
    if (!config) return;

    const all = guild.memberCount;
    const bots = config.bot_count;
    const members = all - bots;

    try {
      if (config.tc_channel) {
        let vc = guild.channels.cache.get(config.tc_channel);
        if (!vc || vc.type !== "voice") await db.setTotalCountChannel(guild.id, null, null);
        else {
          let tc = config.tc_name + " : " + all;
          setVoiceChannelName(vc, tc);
        }
      }
      if (config.mc_channel) {
        let vc = guild.channels.cache.get(config.mc_channel);
        if (!vc || vc.type !== "voice") await db.setMemberCountChannel(guild.id, null, null);
        else {
          let mc = config.mc_name + " : " + members;
          setVoiceChannelName(vc, mc);
        }
      }
      if (config.bc_channel) {
        let vc = guild.channels.cache.get(config.bc_channel);
        if (!vc || vc.type !== "voice") await db.setMemberCountChannel(guild.id, null, null);
        else {
          let bc = config.bc_name + " : " + bots;
          setVoiceChannelName(vc, bc);
        }
      }
    } catch (ex) {
      console.log("Error updating counter channels: " + ex);
    } finally {
      // remove guildId from cache
      const i = COUNTER_PROGRESS.indexOf(guild.id);
      if (i > -1) COUNTER_PROGRESS.splice(i, 1);
    }
  }, 5 * 60 * 1000);
}

module.exports = {
  run,
};
