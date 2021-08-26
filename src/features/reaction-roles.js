const { Client } = require("discord.js");
const { loadReactionRoles, getReactionRole } = require("@schemas/reactionrole-schema");

/**
 * @param {Client} client
 */
async function run(client) {
  await loadReactionRoles();

  client.on("messageReactionAdd", async (reaction) => {
    const data = await fetchRoleData(reaction);
    if (data) {
      await reaction.message.member.roles.add(reaction.message.guild.roles.cache.get(data.role_id));
    }
  });

  client.on("messageReactionRemove", async (reaction) => {
    const data = await fetchRoleData(reaction);
    if (data) {
      await reaction.message.member.roles.remove(reaction.message.guild.roles.cache.get(data.role_id));
    }
  });
}

const fetchRoleData = async (reaction) => {
  if (reaction.partial) reaction = await reaction.fetch();
  const { message, emoji } = reaction;
  const rr = getReactionRole(message.guild.id, message.channel.id, message.id) || [];
  const emote = emoji.id ? emoji.id : emoji.toString();
  return rr.find((doc) => doc.emote === emote);
};

module.exports = {
  run,
};
