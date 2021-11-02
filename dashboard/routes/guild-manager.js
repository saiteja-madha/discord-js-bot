const { getSettings } = require("@schemas/guild-schema");

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

  if (Object.prototype.hasOwnProperty.call(data, "basicUpdate")) {
    data.ranking = data.ranking === "on" ? true : false;
    if (data.ranking !== settings.ranking.enabled) {
      settings.ranking.enabled = data.ranking;
    }

    data.flag_translation = data.flag_translation === "on" ? true : false;
    if (data.flag_translation !== settings.flag_translation.enabled) {
      settings.flag_translation.enabled = data.flag_translation;
    }

    if (data.channels) {
      if (typeof data.channels === "string") {
        data.channels = guild.channels.cache.find((ch) => ch.name === data.channels)?.id;
        settings.flag_translation.channels = [data.channels];
      } else if (Array.isArray(data.channels)) {
        const ids = [];
        data.channels.forEach((name) => {
          let id = guild.channels.cache.find((ch) => ch.name === name)?.id;
          ids.push(id);
        });
        settings.flag_translation.channels = ids;
      }
    }

    data.modlog_channel = guild.channels.cache.find((ch) => "#" + ch.name === data.modlog_channel)?.id;
    if (data.modlog_channel !== settings.automod.log_channel) {
      settings.automod.log_channel = data.modlog_channel;
    }
  }

  if (Object.prototype.hasOwnProperty.call(data, "ticketUpdate")) {
    if (data.limit != settings.ticket.limit) {
      settings.ticket.limit = data.limit;
    }

    data.channel = guild.channels.cache.find((ch) => "#" + ch.name === data.channel)?.id;
    if (data.channel !== settings.ticket.log_channel) {
      settings.ticket.log_channel = data.channel;
    }
  }

  if (Object.prototype.hasOwnProperty.call(data, "inviteUpdate")) {
    data.tracking = data.tracking === "on" ? true : false;
    if (data.tracking !== settings.invite.tracking) {
      settings.invite.tracking = data.tracking;
    }
  }

  if (Object.prototype.hasOwnProperty.call(data, "automodUpdate")) {
    if (data.max_strikes != settings.automod.strikes) {
      settings.automod.strikes = data.max_strikes;
    }

    if (data.automod_action != settings.automod.action) {
      settings.automod.action = data.automod_action;
    }

    if (data.max_lines != settings.automod.max_lines) {
      settings.automod.max_lines = data.max_lines;
    }
    if (data.max_mentions != settings.automod.max_mentions) {
      settings.automod.max_mentions = data.max_mentions;
    }
    if (data.max_role_mentions != settings.automod.max_role_mentions) {
      settings.automod.max_role_mentions = data.max_role_mentions;
    }

    data.anti_links = data.anti_links === "on" ? true : false;
    if (data.anti_links !== settings.automod.anti_links) {
      settings.automod.anti_links = data.anti_links;
    }

    data.anti_scam = data.anti_scam === "on" ? true : false;
    if (data.anti_scam !== settings.automod.anti_scam) {
      settings.automod.anti_scam = data.anti_scam;
    }

    data.anti_invites = data.anti_invites === "on" ? true : false;
    if (data.anti_invites !== settings.automod.anti_invites) {
      settings.automod.anti_invites = data.anti_invites;
    }

    data.anti_ghostping = data.anti_ghostping === "on" ? true : false;
    if (data.anti_ghostping !== settings.automod.anti_ghostping) {
      settings.automod.anti_ghostping = data.anti_ghostping;
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
    data.description = data.description?.replaceAll(/\r\n/g, "\\n");
    if (data.description !== "" && data.description !== settings.welcome.embed?.description) {
      settings.welcome.embed.description = data.description;
    }

    if (data.footer !== "" && data.footer !== settings.welcome.embed?.footer) {
      settings.welcome.embed.footer = data.footer;
    }

    if (data.hexcolor !== "" && data.hexcolor !== settings.welcome.embed?.color) {
      settings.welcome.embed.color = data.hexcolor;
    }

    data.thumbnail = data.thumbnail === "on" ? true : false;
    if (data.thumbnail !== settings.welcome.embed?.thumbnail) {
      settings.welcome.embed.thumbnail = data.thumbnail;
    }

    data.channel = guild.channels.cache.find((ch) => "#" + ch.name === data.channel)?.id;
    if (data.channel !== settings.welcome.channel_id) {
      settings.welcome.channel_id = data.channel;
    }
  }

  if (Object.prototype.hasOwnProperty.call(data, "farewellDisable")) {
    settings.farewell.enabled = false;
  }

  if (
    Object.prototype.hasOwnProperty.call(data, "farewellEnable") ||
    Object.prototype.hasOwnProperty.call(data, "farewellUpdate")
  ) {
    data.description = data.description?.replaceAll(/\r\n/g, "\\n");
    if (data.description !== "" && data.description !== settings.farewell.embed?.description) {
      settings.farewell.embed.description = data.description;
    }

    if (data.footer !== "" && data.footer !== settings.farewell.embed?.footer) {
      settings.farewell.embed.footer = data.footer;
    }

    if (data.hexcolor !== "" && data.hexcolor !== settings.farewell.embed?.color) {
      settings.farewell.embed.color = data.hexcolor;
    }

    data.thumbnail = data.thumbnail === "on" ? true : false;
    if (data.thumbnail !== settings.farewell.embed?.thumbnail) {
      settings.farewell.embed.thumbnail = data.thumbnail;
    }

    data.channel = guild.channels.cache.find((ch) => "#" + ch.name === data.channel)?.id;
    if (data.channel !== settings.farewell.channel_id) {
      settings.farewell.channel_id = data.channel;
    }
  }

  await settings.save();
  res.redirect(303, `/manage/${guild.id}/greeting`);
});

module.exports = router;
