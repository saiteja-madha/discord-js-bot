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
