const utils = require("../utils");

/**
 * @param {{app: import('@slack/bolt').App, client: import('redis').RedisClientType, prisma: import('@prisma/client').PrismaClient}} param1
 */
module.exports = ({ app, client, broadcastMessage, prisma }) => {
  app.message(/.*/gim, async ({ message, say, body }) => {
    if (message.channel == process.env.SLACK_CHANNEL)
      await app.client.chat.delete({
        channel: message.channel,
        ts: message.ts,
        token: process.env.SLACK_BOT_TOKEN,
      });
    if (utils.blockedChannels.includes(message.channel)) return;
    const userRecord = await prisma.user.findFirst({
      where: {
        id: message.user
      }
    })
    if (userRecord && userRecord.optout) return
    broadcastMessage(message)
    message.sort_ts = +new Date() / 1000.0;
    client.lPush(
      `${process.env.INSTANCE_ID || "production"}.messageCache`,
      JSON.stringify(message),
    );
  });
};
