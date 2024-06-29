// This pulls all files in sections/*
// This allows directory to stay modular.
const fs = require("node:fs");
const updateMessage = require("../utils/updateMessage");

/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = async function ({ app, client }) {
  var text = "";
  var sFiles = fs.readdirSync("./sections");
  let sFilesSorted = sFiles.filter((str) => str.endsWith(".js")).sort();

  for (const fn of sFilesSorted) {
    const section = await require(`../sections/${fn}`);
    const rend = (await section.render({ app, client })).trim();
    text += `${section.title}\n\n${rend}\n\n════════════════════════════════════\n`;
  }
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

  text += `\nLast Updated on ${new Date().toLocaleString("en-US", { timeZone: "America/New_York", timeStyle: "long", dateStyle: "long" })}\nWant to dive into a specific subject? Click one of the buttons below:`;
  client.set(`${process.env.INSTANCE_ID || "production"}.messageText`, text);

  try {
    await updateMessage({
      app,
      client,
      text: `New directory update ${new Date()}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: text.replaceAll("@", "​@").replaceAll(/[\u{1F3FB}-\u{1F3FF}]/gmu, ""),
          },
        },
        {
          type: "actions",
          elements: subBlocks,
        },
      ],
      priority: "high",
    });
  } catch (e) {}
};
