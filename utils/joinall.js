/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = async function ({ app, client }) {
  async function rake(cursor) {
    if (process.env.JOIN_ALL_CHANNELS !== "abc") return;
    const convos = await app.client.conversations.list({
      limit: 999,
      cursor,
    });
    let joinPromises = convos.channels.map((channel) => {
      return new Promise(async (resolve) => {
        const channelRecord = await prisma.channel.findFirst({
          where: {
            id: channel.id,
          },
        });
        if (channelRecord && channelRecord.optout) return;
        if (channel.is_member || channel.is_archived || channel.is_private)
          return;
        setTimeout(async () => {
          try {
            await app.client.conversations.join({
              channel: channel.id,
            });
            console.log(`Joined ${channel.name_normalized} (${channel.id})`);
          } catch (e) {
            console.warn(
              `Failed to join ${channel.name_normalized} (${channel.id})`,
            );
          }
          resolve();
        }, 1000);
      });
    });

    await Promise.all(joinPromises);
    if (convos.response_metadata.next_cursor)
      setTimeout(async function () {
        await rake(convos.response_metadata.next_cursor);
      }, 3000);
    else console.log("Finished joining all channels");
  }
  rake();
};
