const { Manager } = require("erela.js");
const Deezer = require("erela.js-deezer");
const Facebook = require("erela.js-facebook");
const Spotify = require("erela.js-spotify");
const { MUSIC } = require("@root/config");

module.exports = class MusicManager extends Manager {
  constructor(client) {
    super({
      nodes: MUSIC.NODES,
      autoPlay: true,
      plugins: [
        new Deezer({
          albumLimit: 1,
          playlistLimit: 1,
        }),

        new Facebook(),

        new Spotify({
          clientID: process.env.SPOTIFY_CLIENT_ID,
          clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
          albumLimit: 1,
          playlistLimit: 1,
        }),
      ],

      send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      },
    });
  }
};
