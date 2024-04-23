# Mochi v2.0.2

## New

- `/bot changelog` command now pulls the bot's mini-changelog for the latest 3
  releases.

## Fixes & Improvements

- Fixed music module not working.

## Developer Notes

- Updated dependencies.
- Lavalink configs are now in the env for security and easy updates.

# Mochi v2.0.1

## New

- Reanabled prefix for `help` command
- Default prefix is now `$` instead of `!`
- Added `reload` prefix command for reloading commands and other bot stuff.
  **DEV only!**

## Developer Notes

- Renamed `./src/commands/developer` to `./src/commands/dev` and
  `./src/commands/information` to `./src/commands/info`
- Added sponsors workflow for GitHub sponsors
- Updated dependencies

# Mochi v2.0.0

## New

- Add Voice channels support

## Fixes & Improvements

- Fixed Cannot read properties of undefined (reading 'find')
- Fix "Unknown Interaction" error when start a giveaway
- Fix help subcommands not loading
- fix music search bug
- Fix `move` command
- fixed rank card
- fix duplicate ranks
- fix invite ranks

## Developer Notes

- fix: upgrade mongoose from 7.3.4 to 8.0.0
- Fix contexts count always 0
- Renamed `./src/commands/moderation/shared` to
  `./src/commands/moderation/message`

  # Mochi v1.1.3

## Developer Notes

- Mochi now runs on Heroku

## What's Changed

- Bump prettier from 3.1.0 to 3.1.1 by @dependabot in
  https://github.com/vixshan/mochi/pull/206
- Bump eslint-plugin-jsdoc from 46.10.1 to 48.0.2 by @dependabot in
  https://github.com/vixshan/mochi/pull/210
- Bump canvacord from 5.4.10 to 6.0.1 by @dependabot in
  https://github.com/vixshan/mochi/pull/211
- Bump prettier from 3.1.1 to 3.2.4 by @dependabot in
  https://github.com/vixshan/mochi/pull/214

## Mochi v1.1.2

### New

- [x] 📜 Stats and invites will be tracked by default

### Fixes

- [x] 🛠 Fixed `leaderboard` command in which servers whose leaderboard is not
      set would send error instead of explaining it

### Developer

- [ ] ⚙️ removed `npm run format` from the `npm run update` script to eliminate
      the possibility of formatting an already formatted code resulting in git
      errors
- [ ] ⚙️ excluded `docs` folder from `npm run format` script to prevent
      formatting the documentation files, which breaks links in gitbook.

## Mochi v1.1.1

### New

- [x] 🤖 Bot is now Mochi
- [x] 📜 Mochi now has ToD
- [x] 📜 Mochi now has a changelog command
- [x] 📜 Mochi now can purge up to 500 messages

### Fixes

- [x] 🛠 Fixed rank card username
- [x] 🛠 Fixed greeting fields can't be deleted in dashboard
- [x] 🛠 Fixed greeting fields not updating in dashboard
- [x] 🛠 Fixed anti-massmention
- [x] 🛠 Fixed null is not snowflake error
- [x] 🛠 Fixed command usage
- [x] 🛠 Fixed replit issues
- [x] 🛠 Fixed suggestion null
- [x] 🛠 Fixed Broken API links

### Developer

- [x] ⚙️ Updated all dependencies to latest versions.
  - @vitalets/google-translate-api (9.1.0 to 9.2.0)
  - discord.js (14.9.0 to 14.12.1)
  - dotenv (16.1.4 to 16.3.1)
  - enhanced-ms (2.2.0 to 2.3.0)
  - module-alias (2.2.2 to 2.2.3)
  - mongoose (7.2.2 to 7.3.4)
  - node-fetch (2.6.11 to 2.6.12)
  - pino (8.11.0 to 8.14.1)
  - pino-pretty (10.0.0 to 10.0.1)

### Removed

- [x] 🗑️ Unnecessary commands removed
