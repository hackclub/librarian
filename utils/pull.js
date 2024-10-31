// This pulls all files in sections/*
// This allows directory to stay modular.
const fs = require("node:fs");

/**
 * @param {{app: import('@slack/bolt').App}} param1
 */
module.exports = async function ({ app, client, prisma }) {
  var text = "";
  var sFiles = fs.readdirSync("./sections");
  let sFilesSorted = sFiles.filter((str) => str.endsWith(".js")).sort();

  for (const fn of sFilesSorted) {
    const section = await require(`../sections/${fn}`);
    var rend = (await section.render({ app, client, prisma })).trim();
    rend = rend.replace(/<@[^|]+\|([^>]+)>/g, "[$1]")
      .replace(/<@.*?>/g, "[user]")
      .replace(/!subteam\^.*?\b/g, "[group]")
      .replaceAll(/[\u{1F3FB}-\u{1F3FF}]/gmu, "")
      .replaceAll("<!channel>", "[channel]")
      .replaceAll("<!here>", "[here]")
      .replaceAll(
        "@",
        "​@",
      )
    await app.client.chat.update({
      channel: process.env.SLACK_CHANNEL,
      ts: await client.get(`${process.env.INSTANCE_ID || "production"}.${section.id}.messageId`),
      text: `*${section.title}*\n\n${rend}\n\n════════════════════════════════════\n`
    });
  }



};
