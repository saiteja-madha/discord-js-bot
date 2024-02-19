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

## Mochi v1.3.1

### Fixes & Improvements

- Mochi now has custom domain `mochi.vikshan.tech` for the website

### Developer Notes

- Added links configs in `config.js` for easier link management
  - `PATREON_URL`
  - `GITHUB_SPONSORS_URL`
  - `BOTS_URL` for a link to your other bots website
