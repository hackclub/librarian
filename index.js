require("dotenv").config();
const { App } = require("@slack/bolt");
const fs = require("fs");
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

(async () => {
  await app.start(process.env.PORT || 3000);
  async function pull() {
    var blocks = [];
    let sPromises = fs
      .readdirSync("./sections")
      .filter((str) => str.endsWith(".js"))
      .sort()
      .map(async (fn) => {
        const section = await require(`./sections/${fn}`);
        const text = (await section.render({ app })).trim();
        blocks.push({
          type: "section",
          text: {
            type: "plain_text",
            text: section.title,
            emoji: true,
          },
        });
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: text,
          },
        });
        blocks.push({
          type: "divider",
        });
      });

    await Promise.all(sPromises);

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
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Last Updated on ${new Date().toLocaleString("en-US", { timeZone: "America/New_York", timeStyle: "short", dateStyle: "long" })} (EST)`,
      },
    });
    app.client.chat.postMessage({
      channel: process.env.SLACK_CHANNEL,
      blocks,
    });
  }
  pull();
  setInterval(pull, 1000 * 30);
  console.log("⚡️ Bolt app is running!");
})();
