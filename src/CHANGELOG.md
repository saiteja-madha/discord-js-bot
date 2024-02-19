# Mochi v2.0.0

## Fixes & Improvements

- Fixed Cannot read properties of undefined (reading 'find')
- Fix "Unknown Interaction" error when start a giveaway
- Fix help subcommands not loading
- fix music search bug
- Fix `move` command

## Developer Notes

- fix: upgrade mongoose from 7.3.4 to 8.0.0
- Fix contexts count always 0
- Renamed `./src/commands/moderation/shared` to
  `./src/commands/moderation/message`

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
