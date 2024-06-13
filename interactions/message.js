const utils = require("../utils");
const pms = require("pretty-ms");

module.exports = ({ app, client }) => {
  /**
   * @param {{app: import('@slack/bolt').App}} param1
   */
  app.message(/.*/gim, async ({ message, say, body }) => {
    if (message.channel == process.env.SLACK_CHANNEL)
      await app.client.chat.delete({
        channel: message.channel,
        ts: message.ts,
        token: process.env.SLACK_USER_TOKEN,
      });
    if (utils.blockedChannels.includes(message.channel)) return;

    if (
      (await client.exists("messageText")) &&
      (await client.exists("messageId"))
    ) {
      const tmpText = await client.get("messageText");
      var newText = tmpText.replace(
        /Latest message: .*? ago/,
        `Latest message: (in <#${message.channel}>) ${pms(Date.now() - Math.floor(parseInt(message.ts) * 1000))} ago`,
      );

      newText = newText
        .split("\n")
        .map((ln) => {
          if (!ln.match(/\[([^\]]+)\]/g)) return ln;
          var newLine = ln
            .match(/\[([^\]]+)\]/g)[0]
            .replace("[", "")
            .replace("]", "")
            .replace(`${body.event.channel}>`, `${body.event.channel}> :boom:`);
          return newLine;
        })
        .join("\n");

      await app.client.chat.update({
        channel: process.env.SLACK_CHANNEL,
        ts: await client.get("messageId"),
        text: newText,
      });
      setTimeout(async function () {
        await app.client.chat.update({
          channel: process.env.SLACK_CHANNEL,
          ts: await client.get("messageId"),
          text: newText.replaceAll(":boom:", ""),
        });
      }, 1000);
      client.set("newChannelMessage", Date.now() + 1300);
    }
  });
};
