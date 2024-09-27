module.exports = {
  title: "⭐ Featured Channels",
  description: "Channels featured by Hack Club",
  /**
    * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}} param1

   */
  render: async function ({ app, prisma }) {
    var channels = await prisma.channel.findMany({
      where: {
        featured: true
      }
    })
    channels = channels.map(channel => `<#${channel.id}> ${channel.description ? `- ${channel.description}` : ""}`)
    return `These are active events and programs featured by Hack Club Staff\n${channels.join("\n")}`
  },
};
