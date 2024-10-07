const utils = require("../utils");
const { createClient } = require("redis");

module.exports = {
  title: "🧵 Top 10 most recently active threads",
  description: "Most active threads in Hack Club",
  /**
   * @param {{app: import('@slack/bolt').App}} param1
   */
  render: async function ({ app, client, prisma }) {
    function reduceText(text, link) {
      const nli = text.indexOf("\n");
      if (nli !== -1) return text.slice(0, nli) + `<${link}|[...]>`;
      if (text.length <= 160) return text
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
          const id = crypto.randomUUID().slice(0, 3);
          client.set(`url.${id}`, `https://hackclub.slack.com/archives/${message.channel}/p${message.ts.toString().replace(".", "")}`)
          acc.push({
            thread_ts: thread_ts,
            permalink: `https://l.hack.club/${id}`,
            text: message.text,
            channel: message.channel,
          });
        }
        return acc;
      }, [])
      .slice(0, 10);

    uniqueMessages.forEach(function (msg) {
      // There is a zero width space in the below "replaceAll".
      // This prevents users from being pinged.
      text += `${reduceText(msg.text, msg.permalink)
        .split("\n")
        .map((str) => "> " + str)
        .join("\n")
        .replace(/<@[^|]+\|([^>]+)>/g, "[$1]")
        .replace(/<@.*?>/g, "[user]")
        .replace(/!subteam\^.*?\b/g, "[group]")
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
