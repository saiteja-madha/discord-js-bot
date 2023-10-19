# CC Limit

Various limits in YAGPDB custom commands (CC) for smooth functioning of the bot and misuse prevention.

### OVERALL <a href="#overall" id="overall"></a>

* **Max amount of CCs:** 100/250 (free/prem)
* **Max CCs that can be triggered by a single action:** 3/5 (free/prem)
* **Character limit:** 10k (5k for join/leave msg, warn dm, etc...)
* **Limit writer:** 25kB
* **Max operations:** 1M/2.5M (free/prem)
* **Response Character Limit:** 2k
* **Generic API based Action call limit:** 100 per CC
* **State Lock based Actions:** 500 per CC (mentionRoleName/ID ; hasRoleName ; targetHasRoleName/ID)

### CALLING A CC <a href="#calling-a-cc" id="calling-a-cc"></a>

#### execCC <a href="#execcc" id="execcc"></a>

* **Calls per CC:** 1/10 (free/prem) -> counter key "runcc"
* **StackDepth limit:** 2 (executing with 0 delay)
* **Delay limit:** int64 limit (292 years)

#### scheduleUniqueCC <a href="#scheduleuniquecc" id="scheduleuniquecc"></a>

* **Calls per CC:** 1/10 (free/prem) -> counter key "runcc"
* **Delay limit:** int64 limit (292 years)
* There can only be 1 per server per key

#### cancelScheduledUniqueCC <a href="#cancelscheduleduniquecc" id="cancelscheduleduniquecc"></a>

* **Calls per CC:** 10/10 (free/prem) -> counter key "cancelcc"

### CONTEXT <a href="#context" id="context"></a>

* **Max file size (complexMessage):** 100kB
* **joinStr max string length:** 1000kB
* **sendDM:** 1 call per CC -> counter key "send\_dm"
* **sendTemplate/sendTemplateDM:** 3 calls per CC -> counter key "exec\_child"
* **addReactions:** 20 calls per CC -> counter key "add\_reaction\_trigger". Each reaction added counts towards the limit.
* **addResponseReactions:** 20 calls per CC -> counter key "add\_reaction\_response". Each reaction added counts towards the limit.
* **addMessageReactions:** 20 calls per CC -> counter key "add\_reaction\_message". Each reaction added counts towards the limit.
* **deleteMessageReaction: 1**0 calls per CC -> counter key "del\_reaction\_message". Each removed added counts towards the limit.
* **editChannelName/Topic:** 10 calls per CC -> counter key "edit\_channel"
* **regex cache limit:** 10 (this means you cant have more than 10 different regexes on a CC)
* **onlineCount:** 1 call per cc -> counter key "online\_users"
* **onlineCountBots:** 1 call per cc -> counter key "online\_bots"
* **editNickname:** 2 calls per cc -> counter key "edit\_nick"
* **Append/AppendSlice limit:** 10k size limit of resulting slice
* **exec/execAdmin:** 5 calls per cc -> no key
* **deleteResponse/deleteMessage/deleteTrigger max delay:** 86400s
* **take/removeRoleID/Name max delay:** int64 limit (292 years)
* **sleep:** 60 seconds

### DATABASE <a href="#database" id="database"></a>

#### Overall Limits <a href="#overall-limits" id="overall-limits"></a>

* **Max amount of DBs:** Membercount \*50\*1/10(free/prem)
* **Key length limit:** 256
* **Expire limit:** int64 limit (292 years)
* **Value size limit:** 100kB

#### Database Interactions <a href="#database-interactions" id="database-interactions"></a>

* **Calls per CC:** 10/50 (free/prem) -> counter key "db\_interactions"
* Valid for all database commands ->
  * dbDel/dbDelByID
  * dbGet
  * dbIncr
  * dbSet/dbSetExpire

#### Database Multiple Entry Interactions <a href="#database-multiple-entry-interactions" id="database-multiple-entry-interactions"></a>

Multiple entries all count to general "db\_interactions" limit as well.

* **Calls per CC:** 2/10 (free/prem) -> counter key "db\_multiple"
* Valid for all database multiple entry related commands ->
  * dbCount
  * dbDelMultiple
  * dbGetPattern
  * dbRank
  * dbTopEntries
