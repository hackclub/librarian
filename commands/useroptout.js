/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}} param1
 */
module.exports = async function ({ app, prisma }) {
    app.command("/useroptout-library", async ({ command, body, ack, respond }) => {
        await ack();
        const userId = body.user_id;
        const userRecord = await prisma.user.findFirst({
            where: {
                id: userId,
            },
        });
        if (!userRecord) {
            await prisma.user.create({
                data: {
                    id: userId,
                    optout: true,
                },
            });
            return await respond(
                "You've been opted out. Run the command again to opt in.",
            );
        }
        else if (userRecord.optout) {
            await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    optout: false,
                },
            });
            return await respond(
                "You've been opted in. Run the command again to opt out.",
            );
        }

        else {
            await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    optout: true,
                },
            });
            return await respond(
                "You've been opted out. Run the command again to opt in.",
            );
        }
    });
};
