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
    channels.map(channel => `<#${channel.id}> ${channel.description ? `- ${channel.description}` : ""}`)
    return channels.join("\n")
  },
};
