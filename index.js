require("dotenv").config();
const { App } = require("@slack/bolt");
const { createClient } = require("redis");
const cron = require("node-cron");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: process.env.PORT ? false : true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT,
});
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

(async () => {
  const client = await createClient({
    url: process.env.REDIS_DATABASE,
  })
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

  // Load commands

  await require("./commands/optout")({ app, client });
  await require("./commands/setlocation")({ app, client });
  await require("./commands/setuserlocation")({ app, client });
  await require("./commands/setemoji")({ app, client });

  // This deletes and sends a new message to bypass the 10 day editing limit

  // This runs the same thing on startup
  await require("./utils/redo")({ app, client });
  // app.message functions go here
  await require("./interactions/message")({ app, client });

  await require("./utils/pull")({ app, client });

  cron.schedule("0,7,14,21,28,35,42,49,56 * * * * *", async () => {
    await require("./utils/pull")({ app, client });
  });

  cron.schedule("0 0,12 * * *", async () => {
    await require("./utils/redo")({ app, client });
    await require("./utils/joinall")({ app, client });
  });

  console.log("Librarian has started.");
  await app.start(process.env.PORT || 3000);
  require("./interactions/channel_created")({ app, client });
})();
