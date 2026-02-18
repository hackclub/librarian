const utils = require("../utils");

const MAX_CACHE_SIZE = 5000;

/**
 * @param {{app: import('@slack/bolt').App, client: import('redis').RedisClientType, prisma: import('@prisma/client').PrismaClient}} param1
 */
module.exports = ({ app, client, broadcastMessage, prisma }) => {
  app.message(/.*/gim, async ({ message, say, body }) => {
    if (utils.blockedChannels.includes(message.channel)) return;
    const userRecord = await prisma.user.findUnique({
      where: { id: message.user },
      select: { optout: true },
    });
    if (userRecord && userRecord.optout) return;
    broadcastMessage(message);
    message.sort_ts = +new Date() / 1000.0;
    const key = `${process.env.INSTANCE_ID || "production"}.messageCache`;
    await client.lPush(key, JSON.stringify(message));
    await client.lTrim(key, 0, MAX_CACHE_SIZE - 1);
  });
};
