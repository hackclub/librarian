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
        if (!channelManagers.includes(command.user_id) && !user.user.is_admin)
            return await respond(
                "Only channel managers and workspace admins can mark a channel as personal",
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
        else if (channelRecord.locked && !user.user.is_admin)
            return await respond(
                "This channel cannot be modified as it is locked in the database. Usually, this is because it is a public, community-owned channel, i.e. #lounge, #code, etc.",
            );
        else if (channelRecord.personal) {
            await prisma.channel.update({
                where: {
                    id: channelId,
                },
                data: {
                    personal: false,
                },
            });
            return await respond(
               "This channel has been marked as regular. Run this command again to mark it as personal.",
            );
        }

        else
            await prisma.channel.update({
                where: {
                    id: channelId,
                },
                data: {
                    personal: true
                },
            });
        await respond("Your channel has been marked as personal. Run this command again to mark it as regular.")
    });
};
