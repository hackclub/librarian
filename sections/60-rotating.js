const utils = require("../utils");
const { createClient } = require("redis");
module.exports = {
    title: ":mega: Channel Advertisement",
    id: "advertisement",
    description: "(new!) channel advertisement thingy idk",
    /**
     * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}} param1
     */
    render: async function ({ app, client, prisma }) {

        const channels = await prisma.channel.findMany({
    
            where: {
                rotating: true
            }
        });
    
        if (!await client.get("rotating")) await client.set("rotating", 0);
        let i = parseInt(await client.get("rotating"));
    
        if (channels.length === 0) return "No rotating channels available.";
    
        const currentChannel = channels[i];
        i = (i + 1) % channels.length; 
        await client.set("rotating", i);
    
        const c = `${currentChannel.emoji} <#${currentChannel.id}>: ${currentChannel.userDescription}\n<https://hackclub.slack.com/docs/T0266FRGM/F08MASSAB71|wanna put your channel here?>`;
        return c
            .replaceAll("@", "​@")
            .replaceAll(/[\u{1F3FB}-\u{1F3FF}]/gmu, "");
    },
};
