const utils = require("../utils");
module.exports = {
  title: "🧵 Top 5 most recently active threads",
  description: "Most active threads in Hack Club",
  /**
   * @param {{app: import('@slack/bolt').App}} param1
   */
  render: async function ({ app, client, prisma }) {
    function reduceText(text, link) {
      if (text.length <= 160) return text;
      if (text.split("\n").length > 1)
        return text.split("\n")[0].slice(0, 160) + `<${link}|[...]>`;
      return text.slice(0, 160) + `<${link}|[...]>`;
    }
    var text = "";
    const cache = (
      await client.lRange(
        `${process.env.INSTANCE_ID || "production"}.messageCache`,
        0,
        -1,
      )
    ).map((obj) => JSON.parse(obj)).sort((a, b) => b.sort_ts - a.sort_ts);
    let uniqueMessages = cache
      .filter(
        (message) =>
          !utils.blockedChannels.includes(message.channel) &&
          message.text &&
          message.thread_ts,
      )
      .reduce((acc, message) => {
        let thread_ts = message.thread_ts;

        if (
          !acc.find((item) => item.thread_ts === thread_ts) &&
          !acc.find((item) => item.channel === message.channel)
        ) {
          acc.push({
            thread_ts: thread_ts,
            permalink: `https://hackclub.slack.com/archives/${message.channel}/p${message.ts.toString().replace(".", "")}`,
            text: message.text,
            channel: message.channel,
          });
        }
        return acc;
      }, [])
      .slice(0, 5);

    uniqueMessages.forEach(function (msg) {
      // There is a zero width space in the below "replaceAll".
      // This prevents users from being pinged.
      text += `${reduceText(msg.text, msg.permalink)
        .split("\n")
        .map((str) => "> " + str)
        .join("\n")
        .replaceAll(/<@[^|]+\|([^>]+)>/g, "[$1]")
        .replaceAll(
          "@",
          "​@",
        )}\nFrom <#${msg.channel}> (<${msg.permalink}|Source>)\n`;
    });
    return text
      .replaceAll("@", "​@")
      .replaceAll(/[\u{1F3FB}-\u{1F3FF}]/gmu, "");
  },
};
