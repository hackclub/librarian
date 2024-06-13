require("dotenv").config();
const { App } = require("@slack/bolt");
const { createClient } = require("redis");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: !Boolean(process.env.PORT),
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT,
});

(async () => {
  const client = await createClient({
    url: process.env.REDIS_DATABASE,
  })
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

  // Load commands

  require("./commands/optout")({ app, client });

  // This deletes and sends a new message to bypass the 10 day editing limit
  setInterval(
    async function () {
      await require("./utils/redo")({ app, client });
    },
    1000 * 60 * 60 * 12,
  );
  // This runs the same thing on startup
  await require("./utils/redo")({ app, client });
  // app.message functions go here
  require("./interactions/message")({ app, client });

  await require("./utils/pull")({ app, client });
  setInterval(async function () {
    await require("./utils/pull")({ app, client });
  }, 1000 * 30);

  console.log("Directory has started.");
  await app.start(process.env.PORT || 3000);
  app.event("channel_created", async ({ event, body }) => {
    const channelId = event.channel.id;
    const userId = event.channel.creator;
    await app.client.conversations.join({
      channel: channelId,
    });
    await app.client.chat.postEphemeral({
      channel: channelId,
      user: userId,
      text: `Nice channel you got there. I'm librarian, which is created by HQ to help people find new and active channels. No message data is collected/stored, just how many messages are sent in a certain timeframe. If you do not want me in this channel and you do not want your channel in #directory, please run the command /optout-directory.`,
    });
  });
})();
