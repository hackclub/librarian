
const emojis = require("../utils/emojis")
/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = async function ({ app }) {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    app.command("/dev-setemoji", async ({ command, body, ack, respond }) => {
        await prisma.$connect()
        await ack();
        if (!command.text)
            return await respond(
                "Please provide an emoji. I.e. /setemoji 🎒 or /setemoji :hackclub:",
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
                "Only channel managers and workspace admins can opt .",
            );
        const channelRecord = await prisma.channel.findFirst({
            where: {
                id: channelId,
            },
        });
        if (!command.text && !command.text.match(/:[a-zA-Z0-9_-]+:/) && !emojis.includes(command.text))
            return await respond("Please provide an emoji")


        if (!channel.channel.is_member)
            try {
                await app.client.conversations.join({
                    channel: channel.channel.id,
                });
            } catch (e) { }
        if (!channelRecord)
            await prisma.channel.create({
                data: {
                    id: channelId,
                    emoji: command.text
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
                emoji: command.text
            },
        });
        await app.client.chat.postEphemeral({
            channel: channel.channel.id,
            user: command.user_id,
            text: `Set your channel emoji to ${command.text}`,
        });
        await prisma.$disconnect()
    });
};
