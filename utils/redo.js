// This utility deletes and resends the message
// Messages can't be edited past 10 days.
/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
const figlet = require("figlet");
const fs = require("node:fs")
module.exports = async function ({ app, client }) {
  const data = await app.client.conversations.history({
    channel: process.env.SLACK_CHANNEL,
  });
  const { messages } = data;

  await Promise.all(
    messages.map((message) =>
      app.client.chat
        .delete({
          token: process.env.SLACK_BOT_TOKEN,
          channel: process.env.SLACK_CHANNEL,
          ts: message?.ts,
          thread_ts: message?.thread_ts,
        })
        .catch((e) => {
          console.warn(e);
        }),
    ),
  );
  const file = await Buffer.from(
    await (
      await fetch(
        "https://cloud-6frqejd8v-hack-club-bot.vercel.app/0hack-club-anime.png",
      )
    ).arrayBuffer(),
  );
  await app.client.files.uploadV2({
    channel_id: process.env.SLACK_CHANNEL,
    file: file,
    filename: "welcome to the hack club channel library!.png",
  });
  var subBlocks = [];
  let bPromises = fs
    .readdirSync("./buttons")
    .filter((str) => str.endsWith(".js"))
    .sort()
    .map(async (fn) => {
      const id = Math.random().toString(32).slice(2);
      const button = await require(`../buttons/${fn}`);
      subBlocks.push({
        type: "button",
        text: {
          type: "plain_text",
          text: button.title,
          emoji: true,
        },
        value: `../buttons/${fn}`,
        action_id: id,
      });
      app.action(id, async ({ ack, respond, say, body }) => {
        await ack();

        await app.client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          text: await require(body.actions[0].value).render({
            app,
            body,
            client,
          }),
        });
      });
    });

  await Promise.all(bPromises);
  setTimeout(async function () {
    var sFiles = fs.readdirSync("./sections");
    let sFilesSorted = sFiles.filter((str) => str.endsWith(".js")).sort().map(file => require(`../sections/${file}`))
    for (const fn of sFilesSorted) {
      var msg = await app.client.chat.postMessage({
        channel: process.env.SLACK_CHANNEL,
        markdown_text: `:spin-loading: Loading library section: ${fn.id}`,
        mrkdwn: true
      });
      await client.set(
        `${process.env.INSTANCE_ID || "production"}.${fn.id}.messageId`,
        msg.ts,
      )
    }

    await app.client.chat.postMessage({
      channel: process.env.SLACK_CHANNEL,
      text: "Find more sections tailored to you by clicking a button below!",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Find more sections tailored to you by clicking a button below!",
          },
        },
        {
          type: "actions",
          elements: subBlocks,
        },
      ],
    });

  }, 5000);
};
