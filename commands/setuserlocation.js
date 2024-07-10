/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = async function ({ app, prisma }) {
  app.command("/setuserlocation", async ({ command, body, ack, respond }) => {
    await prisma.$connect();
    await ack();
    if (!command.text)
      return await respond(
        "Please provide a location. I.e. /setuserlocation Atlanta, Georgia, USA",
      );

    const userRecord = await prisma.user.findFirst({
      where: {
        id: command.user_id,
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
    if (!locations.length)
      return await respond(
        "No locations found. If this keeps failing, please add it to OpenStreetMaps.",
      );
    var { lat, lon, display_name } = locations[0];
    if (!userRecord)
      await prisma.user.create({
        data: {
          id: command.user_id,
          lat,
          lon,
        },
      });
    else
      await prisma.user.update({
        where: {
          id: command.user_id,
        },
        data: {
          lat,
          lon,
        },
      });
    await app.client.chat.postEphemeral({
      channel: body.channel_id,
      user: command.user_id,
      text: `Set your user location to \`${display_name}\`.`,
    });
    await prisma.$disconnect();
  });
};
