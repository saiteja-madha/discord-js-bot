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