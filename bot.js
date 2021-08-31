require("module-alias/register");

const path = require("path");
const { startupCheck } = require("@utils/botUtils");
const { BotClient } = require("@src/structures");
const { launch } = require("@root/dashboard/app");

global.__appRoot = path.resolve(__dirname);

// initialize client
const client = new BotClient();
client.loadCommands("src/commands");
client.loadEvents("src/events");

// catch client errors and warnings
client.on("error", (error) => console.log("Client error: ", error));
client.on("warn", (message) => console.log("Client warning: ", message));

// find unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.log("Unhandled Rejection at: ", reason.stack || reason);
});

(async () => {
  await startupCheck();
  if (client.config.DASHBOARD.enabled) await launch(client);
  await client.initializeMongoose();
  await client.login(client.config.BOT_TOKEN);
})();
