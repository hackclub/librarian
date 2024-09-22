const { createClient } = require("redis");

/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = async function ({ app, text, blocks, priority, client }) {
  if (
    (await client.exists(
      `${process.env.INSTANCE_ID || "production"}.newChannelMessage`,
    )) &&
    Date.now() <
      (await client.get(
        `${process.env.INSTANCE_ID || "production"}.newChannelMessage`,
      ))
  )
    return; // Only high priority should get burst priority
  const messageId = await client.get(
    `${process.env.INSTANCE_ID || "production"}.messageId`,
  );
  const finalText = text
  .replaceAll("@", "​@")
  .replaceAll(/[\u{1F3FB}-\u{1F3FF}]/gmu, "")
  .replaceAll("<!channel>", "[channel]")
  .replaceAll("<!here>", "[here]")
  await client.set(
    `${process.env.INSTANCE_ID || "production"}.messageText`,
    finalText
  );
  await app.client.chat.update({
    channel: process.env.SLACK_CHANNEL,
    ts: messageId,
    text: finalText,
    blocks,
  });
  
  await client.set(
    `${process.env.INSTANCE_ID || "production"}.newChannelMessage`,
    Date.now() + 1000,
  );
};
