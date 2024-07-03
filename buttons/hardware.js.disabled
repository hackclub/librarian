const figlet = require("figlet");
module.exports = {
  title: "Hardware",
  /**
   * @param {{app: import('@slack/bolt').App}} param1
   */
  render: async function ({ app }) {
    return `\`\`\`
${figlet.textSync("Hardware", {
  horizontalLayout: "default",
  verticalLayout: "default",
  width: 60,
  whitespaceBreak: true,
})}
\`\`\`
Hack Club has started the process of getting teenagers into more hardware-based projects!

Trail: 30 Hack Clubbers build PCBs that will be useful on the trail and hike for 7 days on the Pacific Crest Trail from July 12th to July 19th. Travel stipends/aid available to help you go. Learn more at https://trail.hackclub.com (<#C06RQ9TTEG3>)

OnBoard: Get $100 to build your own custom PCB. Learn more at https://hackclub.com/onboard (<#C056AMWSFKJ>)

All of these events and programs are *free* for you to participate in.`;
  },
};
