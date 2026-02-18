const emojis = require("./emojis");

function randomEmoji() {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

async function generateMessageString(messages, currentTime, prisma) {
  const interval = 5;
  const secondsInDay = 86400;
  const intervalsInDay = secondsInDay / interval;
  const timeToChannelMap = {};

  for (const message of messages) {
    if (!message.sort_ts) continue;
    const messageTime = parseInt(message.sort_ts.toString().split(".")[0], 10);
    const timeDiff = currentTime - messageTime;
    const intervalIndex = Math.floor(timeDiff / interval);

    if (intervalIndex < intervalsInDay && !timeToChannelMap[intervalIndex]) {
      const permalink = `https://hackclub.slack.com/archives/${message.channel}/p${message.ts.toString().replace(".", "")}`;
      timeToChannelMap[intervalIndex] = { channelId: message.channel, permalink };
    }
  }

  const channelIds = [...new Set(Object.values(timeToChannelMap).map((v) => v.channelId))];

  const existingChannels = await prisma.channel.findMany({
    where: { id: { in: channelIds } },
    select: { id: true, emoji: true },
  });
  const emojiMap = new Map(existingChannels.map((c) => [c.id, c.emoji]));

  const missingIds = channelIds.filter((id) => !emojiMap.has(id));
  const needsEmojiIds = channelIds.filter((id) => emojiMap.has(id) && !emojiMap.get(id));

  if (missingIds.length > 0) {
    await prisma.channel.createMany({
      data: missingIds.map((id) => {
        const emoji = randomEmoji();
        emojiMap.set(id, emoji);
        return { id, emoji };
      }),
      skipDuplicates: true,
    });
  }

  if (needsEmojiIds.length > 0) {
    await Promise.all(
      needsEmojiIds.map((id) => {
        const emoji = randomEmoji();
        emojiMap.set(id, emoji);
        return prisma.channel.update({ where: { id }, data: { emoji } });
      }),
    );
  }

  const parts = [];
  const limit = Math.min(intervalsInDay, 30);
  for (let i = 0; i < limit; i++) {
    if (timeToChannelMap[i]) {
      const { channelId, permalink } = timeToChannelMap[i];
      const emoji = emojiMap.get(channelId) || randomEmoji();
      parts.push(`<${permalink}|${emoji}>`);
    } else {
      parts.push("-");
    }
  }
  return parts.join("");
}

module.exports = generateMessageString;