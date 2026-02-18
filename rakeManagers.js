const getChannelManagers = require("./utils/channelManagers");

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 */
module.exports = async function rake(prisma) {
    const channels = await prisma.channel.findMany({
        where: {
            personal: true,
            channelManagers: { equals: [] },
        },
        select: { id: true },
    });

    const updates = await Promise.all(
        channels.map(async (channel) => {
            const managers = await getChannelManagers(channel.id);
            return prisma.channel.update({
                where: { id: channel.id },
                data: { channelManagers: managers },
            });
        }),
    );
}