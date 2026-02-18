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
async function rake(cursor) {
  const convos = await app.client.conversations.list({
    limit: 999,
    cursor,
  });
  for (const channel of convos.channels) {
    const existing = await prisma.channel.findUnique({
      where: { id: channel.id },
      select: { id: true },
    });
    if (existing) continue;

    try {
      let emoji = "";
      try {
        emoji = await generateEmoji({ app, id: channel.id });
      } catch (e) {
        emoji = emojis[Math.floor(Math.random() * emojis.length)];
      }
      await prisma.channel.create({
        data: { id: channel.id, emoji },
      });
      console.log(
        `Added ${channel.name_normalized} (${channel.id}) (${emoji})`,
      );
    } catch (e) {
      console.warn(
        `Failed to add ${channel.name_normalized} (${channel.id})`,
      );
    }
  }
  if (convos.response_metadata.next_cursor)
    setTimeout(async function () {
      console.log(`Moving to cursor ${convos.response_metadata.next_cursor}`);
      await rake(convos.response_metadata.next_cursor);
    }, 3000);
  else console.log("Finished adding all channels");
}
rake();
