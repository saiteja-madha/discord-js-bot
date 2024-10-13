# Mochi V2.0.4

## New

- Better settingsing for new guilds.

## Developer Notes

- Added `/dev settingsing` command for triggering the settingsing for one or all
  guilds.

# Mochi V2.0.3

## New

- Added `./src/commands/dev/dev.js` for ALL developer commands.
- Mochi now responds in a more anime-like way to commands.

## Fixes & Improvements

- Fixed `require` to a `dynamic import` in `./src/commands/bot/bot.js` to fix
  the `/changelog` command not working.
- Fixed OWNER/DEV permissions not working.

## Developer Notes

- Deleted codecov workflow
- added `./static-analysis.datadog.yml` for datadog static analysis

# Mochi v2.0.2

## New

- `/bot changelog` command now pulls the bot's mini-changelog for the latest 3
  releases.

## Fixes & Improvements

- Fixed `/bot changelog` command not working.
- Fixed music module not working.
