require("dotenv").config();
const { App, ExpressReceiver } = require("@slack/bolt");
const { createClient } = require("redis");
const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: process.env.PORT ? false : true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT,
  receiver
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
  receiver.router.get('/:id', async (req, res) => {
    const { id } = req.params
    if (!await client.exists(`url.${id}`)) res.send("Sorry, this URL does not exist. If you're following an emoji link, it is no longer valid.") 
    else res.redirect(302, await client.get(`url.${id}`))
  });
  // Load commands

  await require("./commands/optout")({ app, client, prisma });
  await require("./commands/setlocation")({ app, client, prisma });
  await require("./commands/setuserlocation")({ app, client, prisma });
  await require("./commands/setemoji")({ app, client, prisma });

  // This deletes and sends a new message to bypass the 10 day editing limit

  // This runs the same thing on startup
  await require("./utils/redo")({ app, client, prisma });
  // app.message functions go here
  await require("./interactions/message")({ app, client, prisma });

  await require("./utils/pull")({ app, client, prisma });

  cron.schedule("0,7,14,21,28,35,42,49,56 * * * * *", async () => {
    await require("./utils/pull")({ app, client, prisma });
  });

  cron.schedule("0 0,12 * * *", async () => {
    await require("./utils/redo")({ app, client, prisma });
    await require("./utils/joinall")({ app, client, prisma });
  });

  console.log("Librarian has started.");
  await app.start(process.env.PORT || 3000);
  require("./interactions/channel_created")({ app, client });
})();
