const {channelEmojis} = require("../utils")
module.exports = function generateFullTimeline(messages) {

  const intervalMessages = {};
  messages.forEach(message => {
    const timestamp = parseFloat(message.ts);
    const interval = Math.floor(timestamp / 10) * 10;

    if (!intervalMessages[interval]) {
      intervalMessages[interval] = new Set();
    }

    intervalMessages[interval].add(message.channel.id);
  });

  const startTime = Math.min(...Object.keys(intervalMessages).map(Number));
  const endTime = Math.max(...Object.keys(intervalMessages).map(Number));
  let output = '';

  for (let time = startTime; time <= endTime; time += 10) {
    if (intervalMessages[time]) {
      intervalMessages[time].forEach(channelId => {
        output += channelEmojis[channelId] || '💥';
      });
    } else {
      output += '-';
    }
  }

return output.slice(0,20)
}