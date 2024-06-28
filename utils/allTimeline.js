const emojis = require("./emojis");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
module.exports = async function generateFullTimeline(messages) {
  const intervalMessages = {};
  messages.forEach((message) => {
    const timestamp = parseFloat(message.ts);
    const interval = Math.floor(timestamp / 10) * 10;

    if (!intervalMessages[interval]) {
      intervalMessages[interval] = new Set();
    }

    intervalMessages[interval].add(message.channel.id);
  });

  const startTime = Math.min(...Object.keys(intervalMessages).map(Number));
  const endTime = Math.max(...Object.keys(intervalMessages).map(Number));
  let output = "";
  await prisma.$connect()

  for (let time = startTime; time <= endTime; time += 10) {
    if (intervalMessages[time]) {
      for (const channelId of intervalMessages[time]) {
        var emoji = "💥,"
        const channelRecord = await prisma.channel.findFirst({
          where: {
            id: channelId
          }
        })
        if (!channelRecord || !channelRecord.emoji) {
          output += emoji
          continue
        }
        output += channelRecord.emoji + ","
      }
    } else {
      output += "-,";
    }
  }

  let chars = output.split(",");
  chars = chars
    .map((char) => (emojis.includes(char) || char == "-" ? char : ""))
    .slice(chars.length - 40, chars.length);
  await prisma.$disconnect()
  return chars.join(",").replaceAll(",", "");
};
