require("dotenv").config();
const { App, ExpressReceiver } = require("@slack/bolt");
const { createClient } = require("redis");
const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const getCloseChannels = require("./utils/getCloseChannels")
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: !Boolean(process.env.PORT),
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT,
  receiver: process.env.PORT ? receiver : undefined,
});

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

(async () => {
  const client = await createClient({
    url: process.env.REDIS_DATABASE,
  })
    .on("error", (err) => console.error("Redis Client Error", err))
    .connect();
  receiver.router.get("/", async (req, res) => {
    res.redirect(302, "https://github.com/hackclub/channel-directory");
  });
  receiver.router.get("/sls/:id", async (req, res) => {
    const { id } = req.params
    try {
      const text = await getCloseChannels(id)
      res.set("Content-Type", "text/plain").send(text)
    } catch (e) {
      res.set("Content-Type", "text/plain").send("User not found").status(404)
    }
  });
  receiver.router.get("/personal", async (req, res) => {
    const channels = await prisma.channel.findMany({
      where: {
        personal: true
      }
    })
    res.json(channels)
  });
  receiver.router.get("/affinity", async (req, res) => {
    const channels = await prisma.channel.findMany({
      where: {
        affinity: true
      }
    })
    res.json(channels)
  });
  receiver.router.get("/featured", async (req, res) => {
    const channels = await prisma.channel.findMany({
      where: {
        featured: true
      }
    })
    res.json(channels)
  });


  await require("./commands/optout")({ app, client, prisma });
  await require("./commands/setlocation")({ app, client, prisma });
  await require("./commands/setuserlocation")({ app, client, prisma });
  await require("./commands/setemoji")({ app, client, prisma });
  await require("./commands/setfeatured")({ app, client, prisma });
  await require("./commands/setpersonal")({ app, client, prisma });
  await require("./commands/setaffinity")({ app, client, prisma });




  // This deletes and sends a new message to bypass the 10 day editing limit and to show up on the user's unread channel list
  // This runs the same thing on startup
  await require("./utils/redo")({ app, client, prisma });
  // app.message functions go here
  await require("./interactions/message")({ app, client, prisma });


  setInterval(async function () {
    await require("./utils/pull")({ app, client, prisma });
  }, 1000 * 10)
  cron.schedule("0 0,12 * * *", async () => {
    await client.del(`${process.env.INSTANCE_ID || "production"}.messageCache`);
    await require("./utils/redo")({ app, client, prisma });
    await require("./utils/joinall")({ app, client, prisma });
  });

  console.log("Librarian has started.");
  await app.start(process.env.PORT || 3000);
  require("./interactions/channel_created")({ app, client });
  if (process.env.INSTANCE_ID == "production") await require("./utils/joinall")({ app, client, prisma });

})();
