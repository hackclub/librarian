const pms = require("pretty-ms");
const utils = require("../utils");
const generateMessageString = require("../utils/allTimeline");

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

    const now = Math.floor(Date.now() / 1000);
    const timelineString = await generateMessageString(channels, now, prisma);

    const channelMap = channels
      .map((match) => match.channel)
      .reduce((acc, channel) => {
        acc[channel] = (acc[channel] || 0) + 1;
        return acc;
      }, {});

    const prioritizedChannels = (timelineString.match(/<#(\w+)>/g) || []).map(
      (match) => match.replace(/<#|>/g, ""),
    );

    const allChannelIds = Array.from(
      new Set([...prioritizedChannels, ...Object.keys(channelMap)]),
    )
      .sort((a, b) => (channelMap[b] || 0) - (channelMap[a] || 0))
      .slice(0, 20);

    const channelRecords = await prisma.channel.findMany({
      where: { id: { in: allChannelIds } },
      select: { id: true, emoji: true },
    });
    const emojiMap = new Map(channelRecords.map((c) => [c.id, c.emoji]));

    const text = allChannelIds
      .map((channel) => {
        const emoji = emojiMap.get(channel);
        return emoji ? `- ${emoji} <#${channel}>\n` : `- <#${channel}>\n`;
      })
      .join("");

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
${timelineString}
` + text.replaceAll("@", "​@").replaceAll(/[\u{1F3FB}-\u{1F3FF}]/gmu, "")
    );
  },
};
