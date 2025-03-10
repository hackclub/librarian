const emojis = require("../utils/emojis");
const generateEmoji = require("../utils/generateEmoji")

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

module.exports = ({ app, client, prisma }) => {
  /**
   * @param {{app: import('@slack/bolt').App}} param1
   */
  app.event("channel_created", async ({ event, body }) => {
    const channelId = event.channel.id;
    const userId = event.channel.creator;
    await app.client.conversations.join({
      channel: channelId,
    });

    var emoji = ""
    try {
      emoji = (await generateEmoji({ app, id: channelId }));
    } catch (e) {
      emoji = emojis.random();
    }

    await prisma.channel.create({
      data: {
        id: channelId,
        emoji: emoji,
      },
    });
    await app.client.chat.postEphemeral({
      channel: channelId,
      user: userId,
      text: `Nice channel you got there. I'm librarian, which is created by HQ to help people find new and active channels. No message data is collected/stored, just how many messages are sent in a certain timeframe. If you do not want me in this channel and you do not want your channel in #directory, please run the command /optout-directory.
      
      *N.b.:* PLEASE SET A CUSTOM CHANNEL EMOJI USING THE /setemoji COMMAND, otherwise you'll get a random emoji.`,
    });
  });
};
