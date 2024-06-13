/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = async function ({ app, client }) {
  async function rake(cursor) {
    if (process.env.JOIN_ALL_CHANNELS !== "abc") return;
    const convos = await app.client.conversations.list({
      limit: 999,
      cursor,
    });
    let joinPromises = convos.channels.map((channel) => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          await app.client.conversations.join({
            channel: channel.id,
          });
          await app.client.chat.postMessage({
            channel: channel.id,
            text: `Nice channel you got there. I'm librarian, which is created by HQ to help people find new and active channels. No message data is collected/stored, just how many messages are sent in a certain timeframe. If you do not want me in this channel and you do not want your channel in #directory, please run the command /optout-directory.`,
          });
          resolve();
        }, 1000);
      });
    });

    await Promise.all(joinPromises);
    if (convos.response_metadata.next_cursor)
      setTimeout(async function () {
        await rake(convos.response_metadata.next_cursor);
      }, 3000);
    else console.log("Finished joining all channels");
  }
};
