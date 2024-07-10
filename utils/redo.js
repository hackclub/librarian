// This utility deletes and resends the message
// Messages can't be edited past 10 days.
/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
const figlet = require("figlet");
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
  const file = await Buffer.from(
    await (await fetch("https://cloud-6frqejd8v-hack-club-bot.vercel.app/0hack-club-anime.png")).arrayBuffer()
  )
  await app.client.files.uploadV2({
    channel_id: process.env.SLACK_CHANNEL,
    file: file,
    filename: 'welcome to the hack club channel library!.png',
  })

  setTimeout(async function(){

    const tmesg = await app.client.chat.postMessage({
      channel: process.env.SLACK_CHANNEL,
      text: ":spin-loading: Loading library",
    });
    await client.set(
      `${process.env.INSTANCE_ID || "production"}.messageId`,
      tmesg.ts,
    );
  },5000)

};
