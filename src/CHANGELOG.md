## Mochi v1.3.1

### Fixes & Improvements

- Mochi now has custom domain `mochi.vikshan.tech` for the website

### Developer Notes

- Added links configs in `config.js` for easier link management
  - `PATREON_URL`
  - `GITHUB_SPONSORS_URL`
  - `BOTS_URL` for a link to your other bots website

# Mochi v1.3.0

## Developer Notes

- Mochi now runs on Heroku
- ⚙️ Updated all dependencies to latest versions.
- ⚙️ Updated `package.json` to use `node .` to reflect the switch to heroku.

# Mochi v1.2.0

## New

- 📜 Stats and invites will be tracked by default

## Fixes & Improvements

- Moved `CHANGELOG.md` to `src/CHANGELOG.md` folder
- Improved `bot changelog` command to reduce headings of the embeded changelog
- Fixed `leaderboard` command in which servers whose leaderboard is not set
  would send error instead of explaining it
- fixed image base url, rank card now uses infinity API.

## Developer Notes

- ⚙️ removed `npm run format` from the `npm run update` script to eliminate the
  possibility of formatting an already formatted code resulting in git errors
- ⚙️ excluded `docs` folder from `npm run format` script to prevent formatting
  the documentation files, which breaks links in gitbook.

# Mochi v1.1.0

## New

- 🤖 Bot is now Mochi
- 📜 Mochi can start giveaways in announcement channels
- 📜 Mochi now has ToD
- 📜 Mochi now has a changelog command
- 📜 Mochi now can purge up to 500 messages

## Fixes

- 🛠 Fixed rank card username
- 🛠 Fixed greeting fields can't be deleted in dashboard
- 🛠 Fixed greeting fields not updating in dashboard
- 🛠 Fixed anti-massmention
- 🛠 Fixed null is not snowflake error
- 🛠 Fixed command usage
- 🛠 Fixed replit issues
- 🛠 Fixed suggestion null
- 🛠 Fixed Broken API links

## Developer

- ⚙️ Updated all dependencies to latest versions.
  - @vitalets/google-translate-api (9.1.0 to 9.2.0)
  - discord.js (14.9.0 to 14.12.1)
  - dotenv (16.1.4 to 16.3.1)
  - enhanced-ms (2.2.0 to 2.3.0)
  - module-alias (2.2.2 to 2.2.3)
  - mongoose (7.2.2 to 7.3.4)
  - node-fetch (2.6.11 to 2.6.12)
  - pino (8.11.0 to 8.14.1)
  - pino-pretty (10.0.0 to 10.0.1)

## Removed

- 🗑️ Removed unnecessary commands
