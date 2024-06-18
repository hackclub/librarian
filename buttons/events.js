const figlet = require("figlet");
module.exports = {
  title: "Upcoming Events",
  /**
   * @param {{app: import('@slack/bolt').App}} param1
   */
  render: async function ({ app }) {
    const events = await (
      await fetch("https://hackathons.hackclub.com/api/events/upcoming")
    ).json();
    var text = "";
    events.forEach((event) => {
      text += `<${event.website}|${event.name}> (${!event.virtual ? (event.hybrid ? "Hybrid" : "In person") : "Virtual"}) - ${event.city || "Unknown city"}, ${event.state || "Unknown area"}, ${(event.country || event.countryCode, "Unknown country")}\n`;
    });
    return `\`\`\`
${figlet.textSync("Events", {
  horizontalLayout: "default",
  verticalLayout: "default",
  width: 60,
  whitespaceBreak: true,
})}
\`\`\`
Here are a list of upcoming Hackathons:
${text}`;
  },
};
