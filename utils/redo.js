// This utility deletes and resends the message
// Messages can't be edited past 10 days.
/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = async function ({ app, client }) {
  const data = await app.client.conversations.history({
    channel: process.env.SLACK_CHANNEL,
  });
  const { messages } = data;

  await Promise.all(
    messages.map((message) =>
      app.client.chat
        .delete({
          token: process.env.SLACK_USER_TOKEN,
          channel: process.env.SLACK_CHANNEL,
          ts: message?.ts,
          thread_ts: message?.thread_ts,
        })
        .catch((e) => {
          console.warn(e);
        }),
    ),
  );
  const tmesg = await app.client.chat.postMessage({
    channel: process.env.SLACK_CHANNEL,
    text: "Loading drectory",
  });
  await client.set("messageId", tmesg.ts);
};
