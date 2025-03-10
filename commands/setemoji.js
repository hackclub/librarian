const emojis = require("../utils/emojis");
const getChannelManagers = require("../utils/channelManagers");

/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = async function ({ app, prisma }) {
  app.command("/setemoji", async ({ command, body, ack, respond }) => {
    await prisma.$connect();
    await ack();
    if (!command.text)
      return await respond(
        "Please provide an emoji. I.e. /setemoji 🎒 or /setemoji :hackclub:",
      );
    const channelId = body.channel_id;
    const channel = await app.client.conversations.info({
      channel: body.channel_id,
    });
    const channelManagers = await getChannelManagers(body.channel_id);
    const user = await app.client.users.info({
      user: command.user_id,
    });
    if (!channelManagers.includes(command.user_id) && !user.user.is_admin && command.user_id != "U04CBLNSVH6")
      return await respond(
        "Only channel managers and workspace admins can opt a channel.",
      );
    const channelRecord = await prisma.channel.findFirst({
      where: {
        id: channelId,
      },
    });
    if (
      !command.text &&
      !command.text.match(/:[a-zA-Z0-9_-]+:/) &&
      !emojis.includes(command.text)
    )
      return await respond("Please provide an emoji");

    if (!channel.channel.is_member)
      try {
        await app.client.conversations.join({
          channel: channel.channel.id,
        });
      } catch (e) {}
    if (!channelRecord)
      await prisma.channel.create({
        data: {
          id: channelId,
          emoji: command.text,
          emojiSet: true
        },
      });

    await prisma.channel.update({
      where: {
        id: channelId,
      },
      data: {
        optout: false,
        emoji: command.text,
        emojiSet: true
      },
    });
    await app.client.chat.postEphemeral({
      channel: channel.channel.id,
      user: command.user_id,
      text: `Set your channel emoji to ${command.text}`,
    });
    await prisma.$disconnect();
  });
};
