
/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
const emojis = require("./emojis");
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

module.exports = async function ({ app, client }) {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  await prisma.$connect()

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
        if (channelRecord && channelRecord.optout) {
          resolve();
          return;
        }
        if (channel.is_member || channel.is_archived || channel.is_private) {
          resolve();
          return;
        }
        try {
          await app.client.conversations.join({
            channel: channel.id,
          });
          if (!channelRecord){
            await prisma.channel.create({
              data:{
                id: channel.id,
                emoji: emojis.random()
              }
            })
          }
          console.log(`Joined ${channel.name_normalized} (${channel.id})`);
          setTimeout(resolve, 1200);
        } catch (e) {
          console.warn(
            `Failed to join ${channel.name_normalized} (${channel.id})`,
          );
          setTimeout(resolve, 1200);
        }
      });
    }
    if (convos.response_metadata.next_cursor)
      setTimeout(async function () {
        await rake(convos.response_metadata.next_cursor);
      }, 3000);
    else {
      console.log("Finished joining all channels");
      await prisma.$disconnect()
    }

  }
  rake();
};
