// Import dependencies
require('dotenv').config();
require('module-alias/register');

// Import modules
const { BotClient } = require('@src/structures');
const { initializeMongoose } = require('@src/database/mongoose');
const { checkForUpdates } = require('@helpers/BotUtils');
const { validateConfiguration } = require('@helpers/Validator');

// Load extenders
require('@helpers/extenders/Message');
require('@helpers/extenders/Guild');
require('@helpers/extenders/GuildChannel');

// Validate configuration
validateConfiguration();

// Create the client
const client = new BotClient();

// Load commands, contexts, and events
client.loadCommands('src/commands');
client.loadContexts('src/contexts');
client.loadEvents('src/events');

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  client.logger.error('Unhandled promise rejection', error);
});

// Launch the dashboard or initialize the database
async function start() {
  // Check for updates
  await checkForUpdates();

  // Launch the dashboard if enabled
  if (client.config.DASHBOARD.enabled) {
    client.logger.log('Launching dashboard');
    try {
      const { launch } = require('@root/dashboard/app');
      await launch(client); // Let the dashboard initialize the database
    } catch (error) {
      client.logger.error('Failed to launch dashboard', error);
    }
  } else {
    // Initialize the database
    await initializeMongoose();
  }

  // Start the client
  await client.login(process.env.BOT_TOKEN);
}

// Start the bot
start();
