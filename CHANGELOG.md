[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/C0C1PUABU)
## Mochi v1.0.2

### New

- [x] 📜 Stats and invites will be tracked by default

### Fixes

- [x] 🛠 Fixed `leaderboard` command in which servers whose leaderboard is not
      set would send error instead of explaining it

### Developer
- [ ] ⚙️ removed `npm run format` from the `npm run update` script to eliminate the
      possibility of formatting an already formatted code resulting in git errors
- [ ] ⚙️ excluded `docs` folder from `npm run format` script to prevent formatting
      the documentation files, which breaks links in gitbook.

## Mochi v1.0.1

### New

- [x] 🤖 Bot is now Mochi
- [x] 📜 Mochi can start giveaways in announcement channels
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

- [x] 🗑️ Removed nnecessary commands
