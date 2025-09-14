const getChannelManagers = require("../utils/channelManagers");

/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = async function ({ app, prisma }) {
  app.command("/optout-library", async ({ command, body, ack, respond }) => {
    await ack();
    const channelId = body.channel_id;
    const channel = await app.client.conversations.info({
      channel: body.channel_id,
    });
    const user = await app.client.users.info({
      user: command.user_id,
    });
    const channelManagers = await getChannelManagers(body.channel_id);
    if (!channelManagers.includes(command.user_id) && !user.user.is_admin && command.user_id != "U04CBLNSVH6")
      return await respond(
        "Only channel managers and workspace admins can opt a channel out.",
      );
    const channelRecord = await prisma.channel.findFirst({
      where: {
        id: channelId,
      },
    });
    let newOptout;
    if (!channelRecord) {
      newOptout = true;
      await prisma.channel.create({
        data: {
          id: channelId,
          optout: true,
        },
      });
    } else if (channelRecord.optout) {
      newOptout = false;
      await prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          optout: false,
          lat: null,
          lon: null,
        },
      });
      return await respond(
        "Your channel has been updated to show in #library.",
      );
    } else {
      newOptout = true;
      await prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          optout: true,
          lat: null,
          lon: null,
        },
      });
    }
    await app.client.chat.postEphemeral({
      channel: channel.channel.id,
      user: command.user_id,
      text: "This channel has been removed from the library. Please allow up to 1 hour for all data to be flushed.",
    });
    if (channel.channel.is_member)
      await app.client.conversations.leave({
        channel: channel.channel.id,
      });
  });
};
