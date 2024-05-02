const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function generateEnvFile () {
  console.log("Welcome to the Strange Bot setup!\n");
  console.log(
    "Here are some tutorials to get you started:\nMongoDB connection URL: https://www.youtube.com/watch?v=nv38zCeFBHg\nBot Token: https://www.youtube.com/watch?v=aI4OmIbkJH8\nWebhook URL: https://www.youtube.com/watch?v=fKksxz2Gdnc\nBot Secret: https://support.heateor.com/discord-client-id-discord-client-secret/\nWeatherstack API Key: https://weatherstack.com/signup/free\nStrange API Key: https://strangeapi.hostz.me/dashboard\nSpotify Client ID and Secret: https://www.youtube.com/watch?v=WHugvJ0YR5I\n"
  );
  console.log("Please provide the following information (* means required) - right click in the console to paste:\n");

  let envData = {};

  function askDatabaseUrl () {
    rl.question("Enter your MongoDB connection URL*: ", (dbUrl) => {
      const mongoUrlRegex = /^mongodb\+srv:\/\//;
      if (mongoUrlRegex.test(dbUrl)) {
        envData["MONGO_CONNECTION"] = dbUrl;
        askBotToken();
      } else {
        console.log("Invalid MongoDB URL format. Please enter a valid MongoDB URL. Tutorials are above.");
        askDatabaseUrl();
      }
    });
  }

  function askBotToken () {
    rl.question("Enter your bot token*: ", (botToken) => {
      if (botToken.trim().length >= 40) {
        envData["BOT_TOKEN"] = botToken;
        askWebhookErrors();
      } else {
        console.log("Invalid bot token. Please enter a valid token. Tutorials are above.");
        askBotToken();
      }
    });
  }

  function askWebhookErrors () {
    rl.question("Enter the Webhook URL for error logs: ", (errLogs) => {
      const webhookUrlRegex = /^https:\/\/discord\.com\/api\/webhooks/;
      if (webhookUrlRegex.test(errLogs)) {
        envData["ERROR_LOGS"] = errLogs;
        askWebhookJoinLeave();
      } else {
        console.log("Invalid Webhook URL format. Please enter a valid Webhook URL. Tutorials are above.");
        askWebhookErrors();
      }
    });
  }

  function askWebhookJoinLeave () {
    rl.question("Enter the Webhook URL for join/leave logs: ", (joinLeaveLogs) => {
      const webhookUrlRegex = /^https:\/\/discord\.com\/api\/webhooks/;
      if (webhookUrlRegex.test(joinLeaveLogs)) {
        envData["JOIN_LEAVE_LOGS"] = joinLeaveLogs;
        askBotSecret();
      } else {
        console.log("Invalid Webhook URL format. Please enter a valid Webhook URL. Tutorials are above.");
        askWebhookJoinLeave();
      }
    });
  }

  function askBotSecret () {
    rl.question("Enter your bot secret - Required for dashboard: ", (botSecret) => {
      if (botSecret.trim().length >= 20) {
        envData["BOT_SECRET"] = botSecret;
        askWeatherstackApiKey();
      } else {
        console.log("Bot secret is not valid. Please enter a valid secret. Tutorials are above.");
        askBotSecret();
      }
    });
  }

  function askWeatherstackApiKey () {
    rl.question("Enter your Weatherstack API key - Required for Weather Command: ", (weatherStackKey) => {
      if (weatherStackKey.trim().length >= 20) {
        envData["WEATHERSTACK_KEY"] = weatherStackKey;
        askStrangeApiKey();
      } else {
        console.log("Weatherstack API key is not valid. Please enter a valid key. Tutorials are above.");
        askWeatherstackApiKey();
      }
    });
  }

  function askStrangeApiKey () {
    rl.question("Enter your Strange API key - Required for image commands: ", (strangeApiKey) => {
      if (strangeApiKey.trim().length >= 30) {
        envData["STRANGE_API_KEY"] = strangeApiKey;
        askSpotifyClientId();
      } else {
        console.log("Strange API key must be valid. Please enter a valid key. Tutorials are above.");
        askStrangeApiKey();
      }
    });
  }

  function askSpotifyClientId () {
    rl.question("Enter your Spotify Client ID - Required for Spotify Support: ", (spotifyClientId) => {
      if (spotifyClientId.trim().length >= 25) {
        envData["SPOTIFY_CLIENT_ID"] = spotifyClientId;
        askSpotifyClientSecret();
      } else {
        console.log(
          "Spotify Client ID must be at least 25 characters long. Please enter a valid ID. Tutorials are above."
        );
        askSpotifyClientId();
      }
    });
  }

  function askSpotifyClientSecret () {
    rl.question("Enter your Spotify Client Secret - Required for Spotify Support: ", (spotifyClientSecret) => {
      if (spotifyClientSecret.trim().length >= 25) {
        envData["SPOTIFY_CLIENT_SECRET"] = spotifyClientSecret;
        writeEnvFile();
      } else {
        console.log("Spotify Client Secret is not valid. Please enter a valid Secret. Tutorials are above.");
        askSpotifyClientSecret();
      }
    });
  }

  function writeEnvFile () {
    fs.writeFileSync(
      ".env",
      Object.entries(envData)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n")
    );
    console.log("Setup success!");
    rl.close();
  }

  askDatabaseUrl();
}

module.exports = {
  generateEnvFile,
};
