const { Role } = require("discord.js");
const { BotClient } = require("@src/structures");
const { compareArrays } = require("@utils/miscUtils");

/**
 *
 * @param {BotClient} client
 * @param {Role} oldRole
 * @param {Role} newRole
 */
module.exports = async (client, oldRole, newRole) => {
  if (oldRole.managed) return;

  const oldPerms = oldRole.permissions.toArray(false);
  const newPerms = newRole.permissions.toArray(false);

  // If role permissions are changed, sync guild slash command permissions
  if (!compareArrays(oldPerms, newPerms)) {
    await client.syncSlashPermissions(oldRole.guild);
  }
};
