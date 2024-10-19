const getChannelManagers = require("../utils/channelManagers");

/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}} param1
 */
module.exports = async function ({ app, prisma }) {
  app.command("/setfeatured", async ({ command, body, ack, respond }) => {
    await ack();
    const channelId = body.channel_id;
    const channel = await app.client.conversations.info({
      channel: body.channel_id,
    });
    const user = await app.client.users.info({
      user: command.user_id,
    });
    if (!user.user.is_admin && command.user_id != "U04CBLNSVH6")
      return await respond(
        "Only admins can feature a channel.",
      );
    const channelRecord = await prisma.channel.findFirst({
      where: {
        id: channelId,
      },
    });
    if (!channelRecord)
      await prisma.channel.create({
        data: {
          id: channelId,
          optout: false,
          description: channel.channel.topic,
          featured: true
        },
      });
      else if (!channelRecord.featured) {
        await prisma.channel.update({
          where: {
            id: channelId,
          },
          data: {
            featured: true,
            description: channel.channel.topic,
            optout: false
          },
        });
        return await respond(
          "Your channel has been updated to feature in #library. Run the command again to remove it.",
        );
      }
    else if (channelRecord.featured) {
      await prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          featured: false
        },
      });
      return await respond(
        "Your channel has been updated to not feature in #library. Run the command again to add it.",
      );
    }

  
  });
};
