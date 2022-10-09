const Cluster = require('discord-hybrid-sharding');
require("dotenv").config();

const manager = new Cluster.Manager(`${__dirname}/bot.js`, {
    totalShards: 'auto', 
    shardsPerClusters: 2,
    totalClusters: 7,
    mode: 'process', 
    token: process.env.BOT_TOKEN,
    restarts: {
        max: 5, 
        interval: 60000 * 60, 
    },
});

manager.extend(
    new Cluster.HeartbeatManager({
        interval: 2000, 
        maxMissedHeartbeats: 5, 
    })
)
manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));
manager.spawn({ timeout: -1 });
