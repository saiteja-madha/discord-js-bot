# CC Interface

In this page, you will learn about the custom command interface YAGPDB provides
on its dashboard.To make a custom command, we'll follow a set of easy steps
(which really are quite simple).

1. 1.Go to the [dashboard](https://yagpdb.xyz/manage), log in, and select your
   server.
2. 2.On the sidebar, there are several sections, but the one we're interested in
   is the **Core** section. Click that.
3. 3.In the menu that pops up, click **Custom commands**.

Congratulations! You're at the custom commands interface of YAGPDB. When we
start creating more and more custom commands, they will be shown here with line
numbers and syntax highlighting.If you want to go ahead and create your first
custom command, click **Create a new Custom Command**. You'll be greeted with an
interface which has several different options - the trigger and trigger type
(which will be covered later) and restrictions, but what we're interested in is
the **Response**. If you want to take a detour and create your very first custom
command, you'll want to read the page `Outputs 1`.

### Custom Command Options <a href="#custom-command-options" id="custom-command-options"></a>

Other than the `Response` or code of the custom command, there are several other
options available. We'll go over these one by
one.![](https://1817190012-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-LzJt9EfTWz7KsoZZPig%2Fuploads%2Fgit-blob-0467ee2de36a0a33e48bc81fbf86cde2a102b9c2%2Fimage.png?alt=media)When
you create a new custom command, the above is what you will be seeing (or
something close to it). We'll be going over all the options available. If you
are more of a visual learner, the options are numbered on the image. The numbers
correspond to:

1. 1.**Response** - The response / code of the custom command.
2. 2.**Trigger** - What triggers the custom command.
3. 3.**Trigger type** - See below.
4. 4.**Channel/Role restrictions** - Ignore / allow roles / channels to use the
   command.
5. 5.**Custom command group** - Custom command group the command belongs to.

#### Trigger Type <a href="#trigger-type" id="trigger-type"></a>

![](<https://1817190012-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-LzJt9EfTWz7KsoZZPig%2Fuploads%2Fgit-blob-3a98895701580d844768b504c2a4001230cb0321%2Fimage%20(1).png?alt=media>)The
trigger type is the type of trigger you want to use. By default, this is
`Command`. All the available types are listed below in no particular order:

- `None` Type : This is a trigger type with which the custom command cannot be
  triggered from within discord directly and can only be triggered manually or
  from within another custom command. \\
- `Command` Type: This is the one that you'll likely be using for a lot of your
  own custom commands, as it's the same as a built-in command. It can be
  executed with either the prefix set for your server, or by mentioning YAGPDB
  with the command name. If the command name is `foobar`, we could execute it
  either by typing `@YAGPDB.xyz foobar` or `-foobar`. **Note:** with the
  `Command` trigger type, you do not have to add the prefix at the start of your
  trigger - if the command is named `foobar`, the trigger would be just
  `foobar`, not `-foobar`.\\
- `Starts With` Type: This one is rather self explanatory. Anything that starts
  with the trigger will trigger this custom command. For example, if our trigger
  is `hello`, `hello YAGPDB` would trigger our command but `YAGPDB, hello!`
  would not.\\
- `Contains` Type: This type is also quite self explanatory. Anything that
  contains the trigger will trigger this custom command. For example, if our
  trigger is `hello`, _both_ `Hello YAGPDB` and `YAGPDB, hello!` would trigger
  our command.\\
- `Regex` Type: Anything that matches the trigger as a regex will execute this
  custom command. For example, if we had the trigger `\bhey\b`,
  `hey there YAGPDB` would trigger the custom command but `heya YAGPDB` would
  not. [Using Regex](https://docs.yagpdb.xyz/reference/regex) is covered in the
  documentation, so we will leave it at that.\\
- `Exact Match` Type: Anything that matches the trigger (not case sensitive)
  will trigger this custom command. Let's take the example of a custom command
  with the trigger `test`. Both `test` and `TEST` would trigger the custom
  command, while `test YAGPDB` would not.\\
- `Reaction` Type: A special type of custom command that triggers only on
  reactions. When this trigger type is used, the `.` has an additional property
  called `Reaction`, which is documented
  [here](https://docs.yagpdb.xyz/reference/templates#reaction). When using this,
  instead of the trigger, you can see 3 other options which are
  `Added + Removed reactions`, `Added reactions only`, and
  `Removed reactions only`. By default, it is `Added + Removed reactions` which
  will trigger on all reactions. We will talk more about this in a later
  chapter.\\
- `Hourly` and `Minute` interval: This custom command is ran on an interval in a
  given channel. You may optionally ignore specific hours and weekdays. Channel
  selection must be present for this trigger to work.

Hopefully, after reading this, you have a good understanding of what the trigger
type is and what trigger type you wish to use for your custom command.

#### Restrictions <a href="#restrictions" id="restrictions"></a>

When using specific types of custom command, you will be able to set
restrictions on who is able to trigger your custom command. You can ignore /
only run in specific channels and ignore / only run for specific roles.A common
mistake that users make is to either set the required roles to require no roles
or require no channel. If you want the restrictions to be none, you **must** set
the restriction on **ignore (channels / roles)** rather than **require (channels
/ roles)**, otherwise, it will not respond.You can take advantage of this if you
want to disable a command, but in many cases users do this by accident and are
unable to use their CC for apparently no reason.

#### Custom Command Group <a href="#custom-command-group" id="custom-command-group"></a>

When you have more custom commands, you may want to group them. This is when the
`Custom command group` option comes in. After you make a group, it will be
available as a group. All commands are ungrouped by default.**Tip:** After
writing your custom command, you can either `Save` or `Delete` it. Note that for
a custom command to update, you have to press `Save`.
