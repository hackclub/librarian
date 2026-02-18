const emojis = require("../utils/emojis");
const generateEmoji = require("../utils/generateEmoji");

/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}} param1
 */
module.exports = ({ app, client, prisma }) => {

  app.event("channel_created", async ({ event, body }) => {
    const channelId = event.channel.id;
    const userId = event.channel.creator;
    await app.client.conversations.join({
      channel: channelId,
    });

    var emoji = "";
    try {
      emoji = await generateEmoji({ app, id: channelId });
    } catch (e) {
      console.error(e);
      emoji = emojis[Math.floor(Math.random() * emojis.length)];
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
      text: `Nice channel you got there. I'm the Hack Club librarian, which is created by HQ to help people find new and active channels. If you do not want me in this channel and you do not want your channel in #library, please run the command /optout-library.
      
*N.b.:* PLEASE SET A CUSTOM CHANNEL EMOJI USING THE /setemoji COMMAND, otherwise you'll get a random emoji.`,
    });
  });
};
