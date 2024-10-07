# Librarian 

What is Librarian?

Librarian is a global channel directory for almost every channel in Slack made by @aboutdavid during their internship at Hack Club in Summer '24. It shows active threads, channels, and a timeline of almost every message in public slack channels.

Source code: https://github.com/hackclub/librarian

License (MIT): https://github.com/hackclub/channel-directory/blob/main/LICENSE

Questions/Concerns/Feedback/Issues: #library-dev (please ping me, I don't check that channel often)

Commands:

- `/optout-library`: Removes your channel from the global library. You'll need to be a workspace admin or a channel manager. Run it again to opt-in once more.
- `/setemoji [emoji]`: Sets the emoji in the channel you're in. You'll need to be a workspace admin or a channel manager. Custom emojis uploaded to Slack work as well. Don't set it to anything offensive please.
  - Protip: Use `#emojibot` to upload a custom emoji. This isn't maintained by me, but it's cool regardless.
- `/setfeatured`: Features a channel at the top of the library. You need to be a workspace admin. Run it again to remove it.
