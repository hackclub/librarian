const getChannelManagers = require("../utils/channelManagers");

/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = async function ({ app, prisma }) {
    app.command("/setpersonal", async ({ command, body, ack, respond }) => {
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
                "Only channel managers and workspace admins can mark a channel as an affinity channel.",
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
                    personal: true,
                },
            });
        else if (channelRecord.personal) {
            await prisma.channel.update({
                where: {
                    id: channelId,
                },
                data: {
                    affinity: false,
                },
            });
            return await respond(
               "This channel has been marked as regular. Run this command again to mark it as an affinity channel",
            );
        }

        else
            await prisma.channel.update({
                where: {
                    id: channelId,
                },
                data: {
                    affinity: true
                },
            });
        await respond("Your channel has been marked as an affinity channel. Run this command again to mark it as regular.")
    });
};
