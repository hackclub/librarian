const figlet = require("figlet");
module.exports = {
  title: "🔨 Hardware",
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
<#C078GBDKC03>: Join Hack Clubbers in building an open source 3D printer
<#C056AMWSFKJ>:
  - OnBoard: Get $100 to build your own custom PCB. Learn more at https://hackclub.com/onboard
All of these events and programs are *free* for you to participate in.`;
  },
};
