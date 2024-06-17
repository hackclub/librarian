const figlet = require("figlet")
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
This is Hack Club's largest event as of yet.
Build cool things, get awesome things.

Learn more at: https://hackclub.com/arcade`);
    },
  };
  