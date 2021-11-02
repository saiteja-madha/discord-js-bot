const { getUser } = require("@schemas/user-schema");
const Discord = require("discord.js");
const { getSettings } = require("@schemas/guild-schema");

async function fetchGuild(guildID, client, guilds) {
  const guild = client.guilds.cache.get(guildID);
  const settings = await getSettings(guild);
  return { ...guild, ...settings, ...guilds.find((g) => g.id === guild.id) };
}

async function fetchUser(userData, client, query) {
  if (userData.guilds) {
    userData.guilds.forEach((guild) => {
      const perms = new Discord.Permissions(BigInt(guild.permissions));
      if (perms.has("MANAGE_GUILD")) {
        guild.admin = true;
      }
      guild.settingsUrl = client.guilds.cache.get(guild.id)
        ? `/manage/${guild.id}/`
        : `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=2146958847&guild_id=${guild.id}`;
      guild.statsUrl = client.guilds.cache.get(guild.id)
        ? `/stats/${guild.id}/`
        : `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=2146958847&guild_id=${guild.id}`;
      guild.iconURL = guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
        : "https://discordemoji.com/assets/emoji/discordcry.png";
      guild.displayed = query ? guild.name.toLowerCase().includes(query.toLowerCase()) : true;
    });
    userData.displayedGuilds = userData.guilds.filter((g) => g.displayed && g.admin);
    if (userData.displayedGuilds.length < 1) {
      delete userData.displayedGuilds;
    }
  }
  const user = await client.users.fetch(userData.id);
  const userDb = await getUser(user.id);
  const userInfos = { ...user.toJSON(), ...userDb, ...userData, ...user.presence };
  return userInfos;
}

module.exports = { fetchGuild, fetchUser };
