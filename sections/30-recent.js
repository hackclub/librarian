const pms = require("pretty-ms");
const utils = require("../utils");
const util = require("util");
const generateMessageString = require("../utils/allTimeline");

//const timeline = require("../utils/timeline.disabled.js")
module.exports = {
  title: "🆕 Most Recent Activity",
  id: "recent",
  description: "This gets the most recently updates channels",
  /**
   * @param {{app: import('@slack/bolt').App}} param1
   */
  render: async function ({ app, client, prisma }) {
    var messages = (
      await client.lRange(
        `${process.env.INSTANCE_ID || "production"}.messageCache`,
        0,
        -1,
      )
    ).map((obj) => JSON.parse(obj));

    const channels = messages.filter(
      (match) =>
        match.text != "archived the channel" &&
        !utils.blockedChannels.includes(match.channel),
    );
    const channelMap = channels
      .map((match) => match.channel)
      .reduce((acc, channel) => {
        acc[channel] = (acc[channel] || 0) + 1;
        return acc;
      }, {});
    const sortedChannels = Object.keys(channelMap)
      .sort((a, b) => channelMap[b] - channelMap[a])
      .slice(0, 10);
    let text = await Promise.all(
      sortedChannels.map(async (channel) => {
        const channelRecord = await prisma.channel.findFirst({
          where: {
            id: channel,
          },
        });
        if (!channelRecord || !channelRecord.emoji) {
          return `- <#${channel}>\n`;
        } else {
          return `- ${channelRecord.emoji} <#${channel}>\n`;
        }
        // (${await timeline({ app, channel })})
      }),
    ).then((texts) => texts.join(""));
    await prisma.$disconnect();
    if (!messages || messages.length === 0)
      messages = [
        {
          ts: +new Date() / 1000.0,
          channel: process.env.SLACK_CHANNEL,
        },
      ];
    return (
      `This is a list of conversations that are actively ongoing and that you can jump in at any time and meet new people :yay:\n\n:siren-real: Latest message: (in <#${messages[0].channel}>) ${pms(Date.now() - Math.floor(messages[0].ts * 1000))} ago
Below is a scrolling timeline of all messages in Slack going from left to right:
${await generateMessageString(channels, Math.floor(Date.now() / 1000), prisma)}
` + text.replaceAll("@", "​@").replaceAll(/[\u{1F3FB}-\u{1F3FF}]/gmu, "")
    );
  },
};