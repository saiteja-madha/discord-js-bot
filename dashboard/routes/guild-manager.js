const settings = require("@schemas/guild-schema");
const greeting = require("@schemas/greeting-schema");

const express = require("express"),
  utils = require("../utils"),
  CheckAuth = require("../auth/CheckAuth"),
  router = express.Router();

router.get("/:serverID", CheckAuth, async (req, res) => {
  res.redirect(`/manage/${req.params.serverID}/basic`);
});

router.get("/:serverID/basic", CheckAuth, async (req, res) => {
  // Check if the user has the permissions to edit this guild
  const guild = req.client.guilds.cache.get(req.params.serverID);
  if (
    !guild ||
    !req.userInfos.displayedGuilds ||
    !req.userInfos.displayedGuilds.find((g) => g.id === req.params.serverID)
  ) {
    return res.render("404", {
      user: req.userInfos,
      currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
    });
  }

  // Fetch guild informations
  const guildInfos = await utils.fetchGuild(guild.id, req.client, req.user.guilds);

  res.render("manager/basic", {
    guild: guildInfos,
    user: req.userInfos,
    bot: req.client,
    currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
  });
});

router.get("/:serverID/greeting", CheckAuth, async (req, res) => {
  // Check if the user has the permissions to edit this guild
  const guild = req.client.guilds.cache.get(req.params.serverID);
  if (
    !guild ||
    !req.userInfos.displayedGuilds ||
    !req.userInfos.displayedGuilds.find((g) => g.id === req.params.serverID)
  ) {
    return res.render("404", {
      user: req.userInfos,
      currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
    });
  }

  // Fetch guild informations
  const guildInfos = await utils.fetchGreeting(guild.id, req.client, req.user.guilds);

  res.render("manager/greeting", {
    guild: guildInfos,
    user: req.userInfos,
    bot: req.client,
    currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
  });
});

router.post("/:serverID/basic", CheckAuth, async (req, res) => {
  // Check if the user has the permissions to edit this guild
  const guild = req.client.guilds.cache.get(req.params.serverID);
  if (
    !guild ||
    !req.userInfos.displayedGuilds ||
    !req.userInfos.displayedGuilds.find((g) => g.id === req.params.serverID)
  ) {
    return res.render("404", {
      user: req.userInfos,
      currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
    });
  }

  const guildData = await settings.getSettings(guild);
  const data = req.body;

  if (Object.prototype.hasOwnProperty.call(data, "basicUpdate")) {
    if (data.prefix !== "" && guildData.prefix !== data.prefix) {
      await settings.setPrefix(guild.id, data.prefix);
    }

    data.ranking = data.ranking === "on" ? true : false;
    if (data.ranking !== guildData.ranking.enabled) {
      await settings.xpSystem(guild.id, data.ranking);
    }

    data.flag_translation = data.flag_translation === "on" ? true : false;
    if (data.flag_translation !== guildData.flag_translation.enabled) {
      await settings.xpSystem(guild.id, data.flag_translation);
    }

    if (data.channels) {
      if (typeof data.channels === "string") {
        data.channels = guild.channels.cache.find((ch) => ch.name === data.channels)?.id;
        await settings.setFlagTrChannels(guild.id, [data.channels]);
      } else if (Array.isArray(data.channels)) {
        const ids = [];
        data.channels.forEach((name) => {
          let id = guild.channels.cache.find((ch) => ch.name === name)?.id;
          ids.push(id);
        });
        await settings.setFlagTrChannels(guild.id, ids);
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(data, "ticketUpdate")) {
    if (data.limit != guildData.ticket.limit) {
      await settings.setTicketLimit(guild.id, data.limit);
    }

    data.channel = guild.channels.cache.find((ch) => "#" + ch.name === data.channel)?.id;
    if (data.channel !== guildData.ticket.log_channel) {
      await settings.setTicketLogChannel(guild.id, data.channel);
    }
  }

  if (Object.prototype.hasOwnProperty.call(data, "inviteUpdate")) {
    data.tracking = data.tracking === "on" ? true : false;
    if (data.tracking !== guildData.invite.tracking) {
      await settings.inviteTracking(guild.id, data.tracking);
    }
  }

  if (Object.prototype.hasOwnProperty.call(data, "automodUpdate")) {
    if (data.max_lines != guildData.automod.max_lines) {
      await settings.maxLines(guild.id, data.max_lines);
    }
    if (data.max_mentions != guildData.automod.max_mentions) {
      await settings.maxMentions(guild.id, data.max_mentions);
    }
    if (data.max_role_mentions != guildData.automod.max_role_mentions) {
      await settings.maxRoleMentions(guild.id, data.max_role_mentions);
    }

    data.channel = guild.channels.cache.find((ch) => "#" + ch.name === data.channel)?.id;
    if (data.channel !== guildData.automod.log_channel) {
      await settings.setTicketLogChannel(guild.id, data.channel);
    }

    data.anti_links = data.anti_links === "on" ? true : false;
    if (data.anti_links !== guildData.automod.anti_links) {
      await settings.antiLinks(guild.id, data.anti_links);
    }

    data.anti_scam = data.anti_scam === "on" ? true : false;
    if (data.anti_scam !== guildData.automod.anti_scam) {
      await settings.antiScam(guild.id, data.anti_scam);
    }

    data.anti_invites = data.anti_invites === "on" ? true : false;
    if (data.anti_invites !== guildData.automod.anti_invites) {
      await settings.antiInvites(guild.id, data.anti_invites);
    }

    data.anti_ghostping = data.anti_ghostping === "on" ? true : false;
    if (data.anti_ghostping !== guildData.automod.anti_ghostping) {
      await settings.antiGhostPing(guild.id, data.anti_ghostping);
    }
  }

  res.redirect(303, `/manage/${guild.id}/basic`);
});

router.post("/:serverID/greeting", CheckAuth, async (req, res) => {
  // Check if the user has the permissions to edit this guild
  const guild = req.client.guilds.cache.get(req.params.serverID);
  if (
    !guild ||
    !req.userInfos.displayedGuilds ||
    !req.userInfos.displayedGuilds.find((g) => g.id === req.params.serverID)
  ) {
    return res.render("404", {
      user: req.userInfos,
      currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
    });
  }

  const config = (await greeting.getConfig(guild.id)) || { welcome: {}, farewell: {} };
  const data = req.body;

  if (Object.prototype.hasOwnProperty.call(data, "welcomeDisable")) {
    await greeting.setChannel(guild.id, null, "welcome");
  }

  if (
    Object.prototype.hasOwnProperty.call(data, "welcomeEnable") ||
    Object.prototype.hasOwnProperty.call(data, "welcomeUpdate")
  ) {
    data.description = data.description?.replaceAll(/\r\n/g, "\\n");
    if (data.description !== "" && data.description !== config.welcome.embed?.description) {
      await greeting.setDescription(guild.id, data.description, "welcome");
    }

    if (data.footer !== "" && data.footer !== config.welcome.embed?.footer) {
      await greeting.setFooter(guild.id, data.footer, "welcome");
    }

    if (data.hexcolor !== "" && data.hexcolor !== config.welcome.embed?.color) {
      await greeting.setColor(guild.id, data.hexcolor, "welcome");
    }

    data.thumbnail = data.thumbnail === "on" ? true : false;
    if (data.thumbnail !== config.welcome.embed?.thumbnail) {
      await greeting.setThumbnail(guild.id, data.thumbnail, "welcome");
    }

    data.channel = guild.channels.cache.find((ch) => "#" + ch.name === data.channel)?.id;
    if (data.channel !== config.welcome.channel_id) {
      await greeting.setChannel(guild.id, data.channel, "welcome");
    }
  }

  if (Object.prototype.hasOwnProperty.call(data, "farewellDisable")) {
    await greeting.setChannel(guild.id, null, "farewell");
  }

  if (
    Object.prototype.hasOwnProperty.call(data, "farewellEnable") ||
    Object.prototype.hasOwnProperty.call(data, "farewellUpdate")
  ) {
    data.description = data.description?.replaceAll(/\r\n/g, "\\n");
    if (data.description !== "" && data.description !== config.farewell.embed?.description) {
      await greeting.setDescription(guild.id, data.description, "farewell");
    }

    if (data.footer !== "" && data.footer !== config.farewell.embed?.footer) {
      await greeting.setFooter(guild.id, data.footer, "farewell");
    }

    if (data.hexcolor !== "" && data.hexcolor !== config.farewell.embed?.color) {
      await greeting.setColor(guild.id, data.hexcolor, "farewell");
    }

    data.thumbnail = data.thumbnail === "on" ? true : false;
    if (data.thumbnail !== config.farewell.embed?.thumbnail) {
      await greeting.setThumbnail(guild.id, data.thumbnail, "farewell");
    }

    data.channel = guild.channels.cache.find((ch) => "#" + ch.name === data.channel)?.id;
    if (data.channel !== config.farewell.channel_id) {
      await greeting.setChannel(guild.id, data.channel, "farewell");
    }
  }

  res.redirect(303, `/manage/${guild.id}/greeting`);
});

module.exports = router;
