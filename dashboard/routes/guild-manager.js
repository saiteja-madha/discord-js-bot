const { getSettings } = require("@schemas/Guild");

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
  const guildInfos = await utils.fetchGuild(guild.id, req.client, req.user.guilds);

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

  const settings = await getSettings(guild);
  const data = req.body;

  // BASIC CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, "basicUpdate")) {
    if (data.prefix && data.prefix !== settings.prefix) {
      settings.prefix = data.prefix;
    }

    data.flag_translation = data.flag_translation === "on" ? true : false;
    if (data.flag_translation !== (settings.flag_translation.enabled || false)) {
      settings.flag_translation.enabled = data.flag_translation;
    }

    data.invite_tracking = data.invite_tracking === "on" ? true : false;
    if (data.invite_tracking !== (settings.invite.tracking || false)) {
      settings.invite.tracking = data.invite_tracking;
    }
  }

  // STATISTICS CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, "statsUpdate")) {
    data.ranking = data.ranking === "on" ? true : false;
    if (data.ranking !== (settings.stats.enabled || false)) {
      settings.stats.enabled = data.ranking;
    }

    if (data.levelup_message && data.levelup_message !== settings.stats.xp.message) {
      settings.stats.xp.message = data.levelup_message;
    }

    data.levelup_channel = guild.channels.cache.find((ch) => "#" + ch.name === data.levelup_channel)?.id || null;
    if (data.levelup_channel !== settings.stats.xp.channel) {
      settings.stats.xp.channel = data.levelup_channel;
    }
  }

  // TICKET CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, "ticketUpdate")) {
    if (data.limit && data.limit != settings.ticket.limit) {
      settings.ticket.limit = data.limit;
    }

    data.channel = guild.channels.cache.find((ch) => "#" + ch.name === data.channel)?.id;
    if (data.channel !== settings.ticket.log_channel) {
      settings.ticket.log_channel = data.channel;
    }
  }

  // MODERATION CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, "modUpdate")) {
    if (data.max_warnings && data.max_warnings != settings.max_warn.limit) {
      settings.max_warn.limit = data.max_warnings;
    }

    if (data.max_warn_action !== settings.max_warn.action) {
      settings.max_warn.action = data.max_warn_action;
    }

    data.modlog_channel = guild.channels.cache.find((ch) => "#" + ch.name === data.modlog_channel)?.id || null;
    if (data.modlog_channel !== settings.modlog_channel) {
      settings.modlog_channel = data.modlog_channel;
    }
  }

  // AUTOMOD CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, "automodUpdate")) {
    if (data.max_strikes && data.max_strikes !== settings.automod.strikes) {
      settings.automod.strikes = data.max_strikes;
    }

    if (data.automod_action && data.automod_action !== settings.automod.action) {
      settings.automod.action = data.automod_action;
    }

    if (data.max_lines && data.max_lines !== settings.automod.max_lines) {
      settings.automod.max_lines = data.max_lines;
    }

    data.anti_attachments = data.anti_attachments === "on" ? true : false;
    if (data.anti_attachments !== (settings.automod.anti_attachments || false)) {
      settings.automod.anti_attachments = data.anti_attachments;
    }

    data.anti_invites = data.anti_invites === "on" ? true : false;
    if (data.anti_invites !== (settings.automod.anti_invites || false)) {
      settings.automod.anti_invites = data.anti_invites;
    }

    data.anti_links = data.anti_links === "on" ? true : false;
    if (data.anti_links !== (settings.automod.anti_links || false)) {
      settings.automod.anti_links = data.anti_links;
    }

    data.anti_spam = data.anti_spam === "on" ? true : false;
    if (data.anti_spam !== (settings.automod.anti_spam || false)) {
      settings.automod.anti_spam = data.anti_spam;
    }

    data.anti_ghostping = data.anti_ghostping === "on" ? true : false;
    if (data.anti_ghostping !== (settings.automod.anti_ghostping || false)) {
      settings.automod.anti_ghostping = data.anti_ghostping;
    }

    data.anti_massmention = data.anti_massmention === "on" ? true : false;
    if (data.anti_massmention !== (settings.automod.anti_massmention || false)) {
      settings.automod.anti_massmention = data.anti_massmention;
    }

    if (data.channels?.length) {
      if (typeof data.channels === "string") data.channels = [data.channels];
      settings.automod.wh_channels = data.channels
        .map((ch) => guild.channels.cache.find((c) => "#" + c.name === ch)?.id)
        .filter((c) => c);
    }
  }

  await settings.save();
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

  const settings = await getSettings(guild);
  const data = req.body;

  if (Object.prototype.hasOwnProperty.call(data, "welcomeDisable")) {
    settings.welcome.enabled = false;
  }

  if (
    Object.prototype.hasOwnProperty.call(data, "welcomeEnable") ||
    Object.prototype.hasOwnProperty.call(data, "welcomeUpdate")
  ) {
    if (data.content !== settings.welcome.content) {
      settings.welcome.content = data.content;
    }

    data.content = data.content.replace(/\r?\n/g, "\\n");
    if (data.content && data.content !== settings.welcome.content) {
      settings.welcome.content = data.content;
    }

    if (data.description !== settings.welcome.embed.description) {
      settings.welcome.embed.description = data.description;
    }

    data.description = data.description?.replaceAll(/\r\n/g, "\\n");
    if (data.description && data.description !== settings.welcome.embed?.description) {
      settings.welcome.embed.description = data.description;
    }

    if (data.footer !== settings.welcome.embed.footer) {
      settings.welcome.embed.footer = data.footer;
    }

    if (data.footer && data.footer !== settings.welcome.embed?.footer) {
      settings.welcome.embed.footer = data.footer;
    }

    if (data.hexcolor !== settings.welcome.embed.hexcolor) {
      settings.welcome.embed.hexcolor = data.hexcolor;
    }

    if (data.hexcolor && data.hexcolor !== settings.welcome.embed?.color) {
      settings.welcome.embed.color = data.hexcolor;
    }

    if (data.image !== settings.welcome.embed.image) {
      settings.welcome.embed.image = data.image;
    }

    if (data.image && data.image !== settings.welcome.embed?.image) {
      settings.welcome.embed.image = data.image;
    }

    data.thumbnail = data.thumbnail === "on" ? true : false;
    if (data.thumbnail !== (settings.welcome.embed?.thumbnail || false)) {
      settings.welcome.embed.thumbnail = data.thumbnail;
    }

    data.channel = guild.channels.cache.find((ch) => "#" + ch.name === data.channel)?.id;
    if (data.channel !== settings.welcome.channel) {
      settings.welcome.channel = data.channel;
    }

    if (!settings.welcome.enabled) settings.welcome.enabled = true;
  }

  if (Object.prototype.hasOwnProperty.call(data, "farewellDisable")) {
    settings.farewell.enabled = false;
  }

  if (
    Object.prototype.hasOwnProperty.call(data, "farewellEnable") ||
    Object.prototype.hasOwnProperty.call(data, "farewellUpdate")
  ) {
    if (data.content !== settings.farewell.content) {
      settings.farewell.content = data.content;
    }

    data.content = data.content.replace(/\r?\n/g, "\\n");
    if (data.content && data.content !== settings.farewell.content) {
      settings.farewell.content = data.content;
    }

    if (data.description !== settings.farewell.description) {
      settings.farewell.description = data.description;
    }

    data.description = data.description?.replaceAll(/\r\n/g, "\\n");
    if (data.description && data.description !== settings.farewell.embed?.description) {
      settings.farewell.embed.description = data.description;
    }

    if (data.footer !== settings.farewell.footer) {
      settings.farewell.footer = data.footer;
    }

    if (data.footer && data.footer !== settings.farewell.embed?.footer) {
      settings.farewell.embed.footer = data.footer;
    }

    if (data.hexcolor !== settings.farewell.hexcolor) {
      settings.farewell.hexcolor = data.hexcolor;
    }

    if (data.hexcolor && data.hexcolor !== settings.farewell.embed?.color) {
      settings.farewell.embed.color = data.hexcolor;
    }

    if (data.image !== settings.farewell.image) {
      settings.farewell.image = data.image;
    }

    if (data.image && data.image !== settings.farewell.embed?.image) {
      settings.farewell.embed.image = data.image;
    }

    data.thumbnail = data.thumbnail === "on" ? true : false;
    if (data.thumbnail !== (settings.farewell.embed?.thumbnail || false)) {
      settings.farewell.embed.thumbnail = data.thumbnail;
    }

    data.channel = guild.channels.cache.find((ch) => "#" + ch.name === data.channel)?.id;
    if (data.channel !== settings.farewell.channel) {
      settings.farewell.channel = data.channel;
    }

    if (!settings.farewell.enabled) settings.farewell.enabled = true;
  }

  await settings.save();
  res.redirect(303, `/manage/${guild.id}/greeting`);
});

module.exports = router;
