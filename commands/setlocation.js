/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = async function ({ app }) {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  app.command("/setlocation", async ({ command, body, ack, respond }) => {
    await prisma.$connect();
    await ack();
    if (!command.text)
      return await respond(
        "Please provide a location. I.e. /setlocation Atlanta, Georgia, USA",
      );
    const channelId = body.channel_id;
    const channel = await app.client.conversations.info({
      channel: body.channel_id,
    });
    const user = await app.client.users.info({
      user: command.user_id,
    });
    if (command.user_id != channel.channel.creator && !user.user.is_admin)
      return await respond(
        "Only channel managers and workspace admins can opt a user out.",
      );
    const channelRecord = await prisma.channel.findFirst({
      where: {
        id: channelId,
      },
    });
    var locations = await (
      await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({
            q: command.text.trim(),
            format: "jsonv2",
          }),
      )
    ).json();
    if (!channel.channel.is_member)
      try {
        await app.client.conversations.join({
          channel: channel.channel.id,
        });
      } catch (e) {}
    if (!locations.length)
      return await respond(
        "No locations found. If this keeps failing, please add it to OpenStreetMaps.",
      );
    var { lat, lon, display_name } = locations[0];
    if (!channelRecord)
      await prisma.channel.create({
        data: {
          id: channelId,
          lat,
          lon,
        },
      });
    else if (channelRecord.locked && !user.user.is_admin)
      return await respond(
        "This channel cannot be locked as it is locked in the database. Usually, this is because it is a public, community-owned channel, i.e. #lounge, #code, etc.",
      );

    await prisma.channel.update({
      where: {
        id: channelId,
      },
      data: {
        optout: false,
        lat,
        lon,
      },
    });
    await app.client.chat.postEphemeral({
      channel: channel.channel.id,
      user: command.user_id,
      text: `Set your channel location to \`${display_name}\`. Others near you will be able to discover your channel via their location.`,
    });
    await prisma.$disconnect();
  });
};
