const figlet = require("figlet");
module.exports = {
  title: "🕹️ Hack Club Arcade",
  description: "Hack Club 2024 YSWS",
  /**
   * @param {{app: import('@slack/bolt').App}} param1
   */
  render: async function ({ app }) {
    return (text = `\`\`\`
${figlet.textSync("Arcade!", {
  horizontalLayout: "default",
  verticalLayout: "default",
  width: 40,
  whitespaceBreak: true,
})}
\`\`\`                              
Welcome to Hack Club Arcade!
The summer is *yours* for the making
Build your own awesome projects, and the more time you spend, the more things you can get:
i.e. Flipper Zero, Macbook, Multimeters, Stickers and more!

Learn more at: https://hackclub.com/arcade`);
  },
};
