function generateMessageString(messages) {
  messages.sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts));

  let result = "";
  let lastTimestamp = parseFloat(messages[0].ts) * 1000;

  for (let i = 1; i < messages.length; i++) {
    let currentTimestamp = parseFloat(messages[i].ts) * 1000;
    let diffSeconds = (currentTimestamp - lastTimestamp) / 1000;

    let intervals = Math.floor(diffSeconds / 10);

    result += "✉️" + "-".repeat(intervals);

    lastTimestamp = currentTimestamp;
  }

  result += "✉️";

  return result;
}

module.exports = async function ({ app, channel }) {
  try {
    await app.client.conversations.join({
      channel: channel,
    });
  } catch (e) {}
  const data = await app.client.conversations.history({
    channel: channel,
  });
  const latestMessages = data.messages;
  return generateMessageString(latestMessages).slice(0, 6);
};
