const emojis = require("./emojis");
const crypto = require("crypto");
const { createClient } = require("redis");

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

async function getChannelEmoji(channelId, prisma) {
  const channel = await prisma.channel.findFirst({
    where: {
      id: channelId,
    },
  });
  const newEmoji = emojis.random();
  if (!channel)
    await prisma.channel.create({
      data: {
        id: channelId,
        emoji: newEmoji,
      },
    });
  else if (!channel.emoji)
    await prisma.channel.update({
      where: {
        id: channelId,
      },
      data: {
        emoji: newEmoji,
      },
    });
  return channel?.emoji || newEmoji;
}

async function generateMessageString(messages, currentTime, prisma) {
  const client = await createClient({
    url: process.env.REDIS_DATABASE,
  })
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();
  const interval = 10;
  const secondsInDay = 86400;
  const intervalsInDay = secondsInDay / interval;
  let messageString = "";
  const timeToEmojiMap = {};

  for (const message of messages) {
    //console.log(message)
    if (!message.sort_ts) continue;
    const messageTime = parseInt(message.sort_ts.toString().split(".")[0], 10);
    const timeDiff = currentTime - messageTime;
    const intervalIndex = Math.floor(timeDiff / interval);

    if (intervalIndex < intervalsInDay) {
      const emoji = await getChannelEmoji(message.channel, prisma);
      var permalink = `https://hackclub.slack.com/archives/${message.channel}/p${message.ts.toString().replace(".", "")}`;
      timeToEmojiMap[intervalIndex] = { emoji, permalink };
    }
  }

  for (let i = 0; i < intervalsInDay; i++) {
    if (timeToEmojiMap[i]) {
      const { emoji, permalink } = timeToEmojiMap[i];
      const id = crypto.randomUUID().slice(0, 3);
      await client.set(`url.${id}`, permalink);
      messageString += `<https://l.hack.club/${id}|${emoji}>,`;
    } else {
      messageString += "-,";
    }
  }
  await client.disconnect();
  return messageString.split(",").slice(0, 30).join(",").replaceAll(",", "");
}

module.exports = generateMessageString;
