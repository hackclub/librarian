const { createClient } = require("redis");

/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = async function ({ app, text, blocks, priority }) {
    const client = await createClient({
        url: process.env.REDIS_DATABASE,
    })
        .on("error", (err) => console.log("Redis Client Error", err))
        .connect();
    if (priority != "high" && await client.exists(`${process.env.INSTANCE_ID || "production"}.newChannelMessage`) && Date.now() < await client.get(`${process.env.INSTANCE_ID || "production"}.newChannelMessage`))
        return // Only high priority should get burst priority 
    const messageId = await client.get(
        `${process.env.INSTANCE_ID || "production"}.messageId`,
    )
    await app.client.chat.update({
        channel: process.env.SLACK_CHANNEL,
        ts: messageId,
        text,
        blocks
    })
    await client.set(
        `${process.env.INSTANCE_ID || "production"}.newChannelMessage`,
        Date.now() + 2000,
    );
    await client.disconnect()
}