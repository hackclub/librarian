require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { App } = require("@slack/bolt");
const emojis = require("./utils/emojis");
/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: !Boolean(process.env.PORT),
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT,
});
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};
async function rake(cursor) {
  const convos = await app.client.conversations.list({
    limit: 999,
    cursor,
  });
  for (const channel of convos.channels) {
    await new Promise(async (resolve, reject) => {
      const channelRecord = await prisma.channel.findFirst({
        where: {
          id: channel.id,
        },
      });
      if (channelRecord) {
        resolve();
        return;
      }

      try {
        var emoji = ""
        try {
          emoji = (await generateEmoji({ app, id: channel.id }));
        } catch (e) {
          emoji = emojis.random();
        }
        await prisma.channel.create({
          data: {
            id: channel.id,
            emoji: emoji,
          },
        });
        console.log(
          `Added ${channel.name_normalized} (${channel.id}) (${emoji})`,
        );
        resolve();
      } catch (e) {
        console.warn(
          `Failed to add ${channel.name_normalized} (${channel.id})`,
        );
        resolve();
      }
    });
  }
  if (convos.response_metadata.next_cursor)
    setTimeout(async function () {
      console.log(`Moving to cursor ${convos.response_metadata.next_cursor}`);
      await rake(convos.response_metadata.next_cursor);
    }, 3000);
  else console.log("Finished adding all channels");
}
rake();
