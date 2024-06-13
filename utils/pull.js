// This pulls all files in sections/*
// This allows directory to stay modular.
const fs = require("node:fs");
/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = async function ({ app, client }) {
    var text = "";
    let sPromises = fs
        .readdirSync("./sections")
        .filter((str) => str.endsWith(".js"))
        .sort()
        .map(async (fn) => {
            const section = await require(`../sections/${fn}`);
            const rend = (await section.render({ app })).trim();
            text += `${section.title}\n\n${rend}\n\n════════════════════════════════════\n`;
        });

    await Promise.all(sPromises);

    text += `\nLast Updated on ${new Date().toLocaleString("en-US", { timeZone: "America/New_York", timeStyle: "short", dateStyle: "long" })} (EST)`;
    client.set("messageText", text);
    app.client.chat.update({
        channel: process.env.SLACK_CHANNEL,
        ts: await client.get("messageId"),
        text,
    });
};
