const utils = require("../utils");
const { createClient } = require("redis");

module.exports = {
    title: ":public-channel: Recently created channels",
    id: "newchannels",
    description: "Here's a list of recently created channels",
    /**
     * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}} param1
     */
    render: async function ({ app, client, prisma }) {

        const channels = await prisma.channel.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        const c = channels.slice(0, 10).map(channel => `- ${channel.emoji} <#${channel.id}>${channel.personal? " :bust_in_silhouette:":""}`).join("\n")
        return `Here's a list of recently created channels:\n${c}`
            .replaceAll("@", "​@")
            .replaceAll(/[\u{1F3FB}-\u{1F3FF}]/gmu, "");
    },
};
