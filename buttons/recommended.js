const { Gorse } = require("gorsejs")
const client = new Gorse({ endpoint: process.env.GORSE_ENDPOINT, secret: process.env.GORSE_SECRET });
module.exports = {
    title: "🎯 Recommended for me",
    /**
     * @param {{app: import('@slack/bolt').App}} param1
     */
    render: async function ({ app, body }) {
        var recommends = await client.getRecommend({ userId: body.user.id, cursorOptions: { n: 10 } })

        recommends = recommends.map(rec => `- <#${rec}>`).join("\n")
        return `Recyard in *beta*. Based on your recent history in the Slack, here are some channels recommended for you:
        
${recommends}

There are more features in Recyard like finding popular channels and those similar to the one you're in. Check it out in <#C07SREWJ4DA>`;
    },
};
