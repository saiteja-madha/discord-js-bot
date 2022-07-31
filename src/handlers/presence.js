const { ActivityType } = require("discord.js");

/**
 * @param {import('@src/structures').BotClient} client
 */
function updatePresence(client) {
  let message = client.config.PRESENCE.MESSAGE;

  if (message.includes("{servers}")) {
    message = message.replaceAll("{servers}", client.guilds.cache.size);
  }

  if (message.includes("{members}")) {
    const members = client.guilds.cache.map((g) => g.memberCount).reduce((partial_sum, a) => partial_sum + a, 0);
    message = message.replaceAll("{members}", members);
  }

  const getType = (type) => {
    switch (type) {
      case "COMPETING":
        return ActivityType.Competing;

      case "LISTENING":
        return ActivityType.Listening;

      case "PLAYING":
        return ActivityType.Playing;

      case "WATCHING":
        return ActivityType.Watching;
    }
  };

  client.user.setPresence({
    status: client.config.PRESENCE.STATUS,
    activities: [
      {
        name: message,
        type: getType(client.config.PRESENCE.TYPE),
      },
    ],
  });
}

module.exports = function handlePresence(client) {
  updatePresence(client);
  setInterval(() => updatePresence(client), 10 * 60 * 1000);
};
