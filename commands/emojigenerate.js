
const generateEmoji = require("../utils/generateEmoji")
/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}} param1
 */
module.exports = async function ({ app, prisma }) {
    app.command("/emojigenerate", async ({ command, body, ack, respond }) => {
        await ack();
        const channelRecord = await prisma.channel.findFirst({
            where: {
                id: body.channel_id,
            },
        });
        if (!channelRecord.emojiSet) {
            return await respond(
                "The emoji has already been set by a user.",
            );
        }
        const emoji = await generateEmoji({ app, id: body.channel_id })
        await prisma.channel.update({
            where: {
                id: body.channel_id,
            },
            data: {
                emoji: emoji,
            },
        });
        return await respond(
            `Emoji set to ${emoji}.`,
        );
    });
};
