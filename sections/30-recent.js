const pms = require("pretty-ms");
const utils = require("../utils");
module.exports = {
  title: "🆕 Most Recent Activity",
  description: "This gets the most recently updates channels",
  /**
   * @param {{app: import('@slack/bolt').App}} param1
   */
  render: async function ({ app, client }) {
    var messages = null
    const messageRecentTs = await client.get(process.env.INSTANCE_ID || "production" + ".messageRecentTs")
    if (await client.exists(process.env.INSTANCE_ID || "production" + ".messageRecentTs") && messageRecentTs > Date.now()) {
      messages = (await client.get(process.env.INSTANCE_ID || "production" + ".messageRecent")) || {
        messages: {
          matches: []
        }
      }
    } else {
      messages = await app.client.search.messages({
        query: utils.queries.topChannels,
        sort: "timestamp",
        sort_dir: "desc",
        count: 100,
        token: process.env.SLACK_USER_TOKEN,
      });
      await client.set(process.env.INSTANCE_ID || "production" + ".messageRecent", JSON.stringify(messages))
      await client.set(process.env.INSTANCE_ID || "production" + ".messageRecentTs", Date.now + 6200)
    }
    const channels = messages.messages.matches
      .filter(
        (match) =>
          match.channel.is_channel &&
          !match.channel.is_private &&
          match.text != "archived the channel" &&
          !utils.blockedChannels.includes(match.channel.id),
      )
      .map((match) => match.channel.id)
      .reduce((acc, channel) => {
        acc[channel] = (acc[channel] || 0) + 1;
        return acc;
      }, {});
    const sortedChannels = Object.keys(channels).sort(
      (a, b) => channels[b] - channels[a],
    ).slice(0, 10)
    var text = `This is a list of conversations that are actively ongoing and that you can jump in at any time and meet new people :yay:\n\n:siren-real: Latest message: (in <#${messages.messages.matches[0].channel.id}>) ${pms(Date.now() - Math.floor(messages.messages.matches[0].ts * 1000))} ago\n\n`;
    sortedChannels.forEach((channel) => {
      text += `- <#${channel}>\n`;
    });
    return text;
  },
};
