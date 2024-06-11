require("dotenv").config();
const { App } = require("@slack/bolt");
const fs = require("fs");
const { createClient } = require("redis");
const pms = require("pretty-ms");
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: !Boolean(process.env.PORT),
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.PORT
});




(async () => {

    const client = await createClient({
        url: process.env.REDIS_DATABASE
    })
        .on('error', err => console.log('Redis Client Error', err))
        .connect();

    async function redoMessage() {

        const data = await app.client.conversations.history({
            channel: process.env.SLACK_CHANNEL,
        });
        const { messages } = data;

        await Promise.all(
            messages.map((message) =>
                app.client.chat
                    .delete({
                        token: process.env.SLACK_USER_TOKEN,
                        channel: process.env.SLACK_CHANNEL,
                        ts: message?.ts,
                        thread_ts: message?.thread_ts,
                    })
                    .catch((e) => {
                        console.warn(e);
                    }),
            ),
        );
        const tmesg = await app.client.chat.postMessage({
            channel: process.env.SLACK_CHANNEL,
            text: "Loading drectory",
        });
        await client.set("messageId", tmesg.ts)
    }

    setInterval(redoMessage, 1000 * 60 * 60 * 12)
    await redoMessage()
    await app.start(process.env.PORT || 3000);

    app.message(/.*/gim, async ({ message, say }) => {

        //if (await client.exists("newChannelMessage") && parseInt(client.get("newChannelMessage")) > Date.now()) return
        if (await client.exists("messageText") && await client.exists("messageId")) {
            const tmpText = await client.get("messageText")
            const newText = tmpText.replace(/Latest message: .*? ago/, `Latest message: ${pms(Date.now() - Math.floor(parseInt(message.ts) * 1000))} ago`)
            console.log(await client.get("messageId"), process.env.SLACK_CHANNEL)
            app.client.chat.update({
                channel: process.env.SLACK_CHANNEL,
                ts: await client.get("messageId"),
                text: newText
            })
        }

    });
    var text = ""
    async function pull() {
        let sPromises = fs
            .readdirSync("./sections")
            .filter((str) => str.endsWith(".js"))
            .sort()
            .map(async (fn) => {
                const section = await require(`./sections/${fn}`);
                const rend = (await section.render({ app })).trim();
                text += `${section.title}\n\n${rend}\n\n════════════════════════════════════\n`

            });

        await Promise.all(sPromises);
        /*
             */
        text += `\nLast Updated on ${new Date().toLocaleString("en-US", { timeZone: "America/New_York", timeStyle: "short", dateStyle: "long" })} (EST)`
        client.set("messageText", text)
        app.client.chat.update({
            channel: process.env.SLACK_CHANNEL,
            ts: await client.get("messageId"),
            text,
        });
    }
    pull();
    setInterval(pull, 1000 * 3000);
    console.log("⚡️ Bolt app is running!");
})();
