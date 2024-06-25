const utils = require("../utils");
const pms = require("pretty-ms");
const fs = require("node:fs");
/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = ({ app, client }) => {
  app.message(/.*/gim, async ({ message, say, body }) => {
    if (message.channel == process.env.SLACK_CHANNEL)
      await app.client.chat.delete({
        channel: message.channel,
        ts: message.ts,
        token: process.env.SLACK_USER_TOKEN,
      });
    if (utils.blockedChannels.includes(message.channel)) return;
    if (await client.exists(`${process.env.INSTANCE_ID || "production"}.newChannelMessage`) || Date.now() < client.get(`${process.env.INSTANCE_ID || "production"}.newChannelMessage`))
    if (
      (await client.exists(
        `${process.env.INSTANCE_ID || "production"}.messageText`,
      )) &&
      (await client.exists(
        `${process.env.INSTANCE_ID || "production"}.messageId`,
      ))
    ) {
      const tmpText = await client.get(
        `${process.env.INSTANCE_ID || "production"}.messageText`,
      );
      var newText = tmpText.replace(
        /Latest message: .*? ago/,
        `Latest message: (in <#${message.channel}>) ${pms(Date.now() - Math.floor(parseInt(message.ts) * 1000))} ago`,
      );

      newText = newText
        .split("\n")
        .map((ln) => {
          return ln.replaceAll(
            `<#${body.event.channel}>`,
            `<#${body.event.channel}> :boom:`,
          );
        })
        .join("\n");
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
              text: await require(body.actions[0].value).render({ app, body }),
            });
          });
        });

      await Promise.all(bPromises);
      try {
        await app.client.chat.update({
          channel: process.env.SLACK_CHANNEL,
          ts: await client.get(
            `${process.env.INSTANCE_ID || "production"}.messageId`,
          ),
          text: `New directory update ${new Date()}`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: newText,
              },
            },
            {
              type: "actions",
              elements: subBlocks,
            },
          ],
        });
        setTimeout(async function () {
          await app.client.chat.update({
            channel: process.env.SLACK_CHANNEL,
            ts: await client.get(
              `${process.env.INSTANCE_ID || "production"}.messageId`,
            ),
            text: `New directory update ${new Date()}`,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: newText.replaceAll(" :boom:", ""),
                },
              },
              {
                type: "actions",
                elements: subBlocks,
              },
            ],
          });
        }, 1000);
      } catch (e) {}
      await client.set(
        `${process.env.INSTANCE_ID || "production"}.newChannelMessage`,
        Date.now() + 2000,
      );
    }
  });
};
