const emojis = require("./emojis");


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
  const interval = 5;
  const secondsInDay = 86400;
  const intervalsInDay = secondsInDay / interval;
  let messageString = "";
  const timeToEmojiMap = {};

  for (const message of messages) {
    if (!message.sort_ts) continue;
    const messageTime = parseInt(message.sort_ts.toString().split(".")[0], 10);
    const timeDiff = currentTime - messageTime;
    const intervalIndex = Math.floor(timeDiff / interval);

    if (intervalIndex < intervalsInDay && !timeToEmojiMap[intervalIndex]) {
      const emoji = await getChannelEmoji(message.channel, prisma);
      const permalink = `https://hackclub.slack.com/archives/${message.channel}/p${message.ts.toString().replace(".", "")}`;
      timeToEmojiMap[intervalIndex] = { emoji, permalink };
    }
  }

  for (let i = 0; i < intervalsInDay; i++) {
    if (timeToEmojiMap[i]) {
      const { emoji, permalink } = timeToEmojiMap[i];
      messageString += `<${permalink}|${emoji}>,`;
    } else {
      messageString += "-,";
    }
  }
  return messageString.split(",").slice(0, 30).join(",").replace(/,/g, "");
}

module.exports = generateMessageString;