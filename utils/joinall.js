
const emojis = require("./emojis");
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};
/**
  * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}} param1
 */
module.exports = async function ({ app, client, prisma }) {
  if (process.env.INSTANCE_ID !== "production") return
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
          if (channelRecord) {
            await prisma.channel.update({
              where: {
                id: channel.id,
              },
              data: {
                name: channel.name
              }
            })
          }
          resolve();
          return;
        }
        try {
          await app.client.conversations.join({
            channel: channel.id,
          });
          var emoji = ""
          try {
            emoji = (await generateEmoji({ app, id: channel.id }));
          } catch (e) {
            emoji = emojis.random();
          }
          if (!channelRecord) {
            await prisma.channel.create({
              data: {
                id: channel.id,
                emoji: emoji,
                name: channel.name
              },
            });
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
    }
  }
  rake();
};
