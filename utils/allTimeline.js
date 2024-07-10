const emojis = require("./emojis");

async function getChannelEmoji(channelId, prisma) {
  const channel = await prisma.channel.findFirst({
    where: {
      id: channelId
    }
  })
  if (!channel || !channel.emoji) return "💥"
  return channel.emoji
}


async function generateMessageString(messages, currentTime, prisma) {
  const interval = 10; 
  const secondsInDay = 86400; 
  const intervalsInDay = secondsInDay / interval;

  let messageString = '';
  const timeToEmojiMap = {};

  for (const message of messages) {
    const messageTime = parseInt(message.ts.split('.')[0], 10); 
    const timeDiff = currentTime - messageTime;
    const intervalIndex = Math.floor(timeDiff / interval);

    if (intervalIndex < intervalsInDay) {
      const emoji = await getChannelEmoji(message.channel.id, prisma);
      timeToEmojiMap[intervalIndex] = { emoji, permalink: message.permalink };
    }
  }

  for (let i = 0; i < intervalsInDay; i++) {
    if (timeToEmojiMap[i]) {
      const { emoji, permalink } = timeToEmojiMap[i];
      messageString += `<${permalink}|${emoji}>,`;
    } else {
      messageString += '-,';
    }
  }

  return messageString.split(",").slice(0, 10).join(",").replaceAll(",", "");
}


module.exports = generateMessageString

