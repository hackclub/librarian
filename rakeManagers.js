/**
  * @param {import('@prisma/client').PrismaClient} prisma

 */
module.exports = async function rake(prisma) {
    const channels = await prisma.channel.findMany({
        where: {
            personal: true,
            channelManagers: {
                equals: []
            }
        }
    })

    channels.map(async channel => {
        await prisma.channel.update({
            where: {
                id: channel.id

            },
            data: {
                channelManagers: (await require("./utils/channelManagers")(channel.id))
            }
        })
    })
}