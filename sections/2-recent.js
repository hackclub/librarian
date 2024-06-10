const pms = require("pretty-ms");
const utils = require("../utils");
module.exports = {
  title: "🆕 Most Recent Activity",
  description: "This gets the most recently updates channels",
  /**
   * @param {{app: import('@slack/bolt').App}} param1
   */
  render: async function ({ app }) {
    const query = "-is:dm";
    let messages = await app.client.search.messages({
      query,
      sort: "timestamp",
      sort_dir: "desc",
      count: 100,
      token: process.env.SLACK_USER_TOKEN,
    });
    var text = `:siren-real: Latest message: ${pms(Date.now() - Math.floor(messages.messages.matches[0].ts * 1000))} ago (from *now*)\n\n`;

    const channels = messages.messages.matches
      .filter(
        (match) =>
          match.channel.is_channel &&
          !match.channel.is_private &&
          !utils.blockedChannels.includes(match.channel.id),
      )
      .map((match) => match.channel.id)
      .reduce((acc, channel) => {
        acc[channel] = (acc[channel] || 0) + 1;
        return acc;
      }, {});
    const sortedChannels = Object.keys(channels).sort(
      (a, b) => channels[b] - channels[a],
    );

    sortedChannels.forEach((channel) => {
      text += `<#${channel}> `;
    });
    return text;
  },
};
