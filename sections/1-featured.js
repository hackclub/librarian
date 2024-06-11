module.exports = {
  title: "⭐ Featured Channels",
  description: "Channels featured by Hack Club",
  /**
   * @param {{app: import('@slack/bolt').App}} param1
   */
  render: async function ({ app }) {
    return (text = `<#C75M7C0SY> - Introduce yourself to the community here
<#C0266FRGV> - Meet new people here
<#C0266FRGT> - Get updates about Hack Club
<#C06SBHMQU8G> - Every hour more power: Get rewarded with cool prizes for working on your own projects
<#C05T8E9GY64> - Days of Service a program to support girls and non-binary people learning to code.
<#C056WDR3MQR> - Free, powerful, and versatile compute infrastructure for all high school hackers!
<#C02PA5G01ND> - Gain new insight as a Hack Club leader to bring back to your club`);
  },
};
