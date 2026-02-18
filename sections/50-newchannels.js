const utils = require("../utils");

module.exports = {
  title: ":public-channel: Recently created channels",
  id: "newchannels",
  description: "Here's a list of recently created channels",
  /**
   * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}} param1
   */
  render: async function ({ app, client, prisma }) {
    const channels = await prisma.channel.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, emoji: true, personal: true, name: true },
    });
    const c = channels
      .map(channel => `- ${channel.emoji} <#${channel.id}>${channel.personal ? " :bust_in_silhouette:" : ""} ${channel.name ? `(${channel.name})` : ""}`)
      .join("\n");
    return `Here's a list of recently created channels:\n${c}`
      .replaceAll("@", "​@")
      .replaceAll(/[\u{1F3FB}-\u{1F3FF}]/gmu, "");
  },
};
