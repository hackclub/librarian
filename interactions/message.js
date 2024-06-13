const utils = require("../utils");
const pms = require("pretty-ms");

module.exports = ({ app, client }) => {
  app.message(/.*/gim, async ({ message, say }) => {
    if (
      (await client.exists("newChannelMessage")) &&
      parseInt(client.get("newChannelMessage")) > Date.now()
    )
      return;
    if (utils.blockedChannels.includes(message.channel)) return;
    if (
      (await client.exists("messageText")) &&
      (await client.exists("messageId"))
    ) {
      const tmpText = await client.get("messageText");
      const newText = tmpText.replace(
        /Latest message: .*? ago/,
        `Latest message: (in <#${message.channel}>) ${pms(Date.now() - Math.floor(parseInt(message.ts) * 1000))} ago`,
      );
      console.log(await client.get("messageId"), process.env.SLACK_CHANNEL);
      app.client.chat.update({
        channel: process.env.SLACK_CHANNEL,
        ts: await client.get("messageId"),
        text: newText,
      });
    }
  });
  app.message(/.*/gim, async ({ message }) => {
    if (message.channel == process.env.SLACK_CHANNEL)
      await app.client.chat.delete({
        channel: message.channel,
        ts: message.ts,
        token: process.env.SLACK_USER_TOKEN,
      });
  });
};
