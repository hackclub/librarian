const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = async function ({ app }) {
  app.command("/optout-library", async ({ command, body, ack, respond }) => {
    await ack();
    const channelId = body.channel_id;
    const channel = await app.client.conversations.info({
      channel: body.channel_id,
    });
    const user = await app.client.users.info({
      user: command.user_id,
    });
    if (command.user_id != channel.channel.creator || !user.user.is_admin)
      return await respond(
        "Only channel managers and workspace admins can opt a user out.",
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
          optout: true,
        },
      });
    else if (channelRecord.locked)
      return await respond(
        "This channel cannot be locked as it is locked in the database. Usually, this is because it is a public, community-owned channel, i.e. #lounge, #code, etc.",
      );
    else if (channelRecord.optout)
      return await respond("This channel is already opted out of the library.");
    else
      await prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          optout: true,
        },
      });
    await app.client.chat.postEphemeral({
      channel: channel.channel.id,
      user: command.user_id,
      text: "This channel has been removed from the library. Please allow up to 1 hour for all data to be flushed.",
    });
    if (channel.channel.is_member)
      await app.client.conversations.leave({
        channel: channel.channel.id,
      });

    await respond(`${command.text}`);
  });
};