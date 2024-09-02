module.exports = {
  title: "⭐ Featured Channels",
  description: "Channels featured by Hack Club",
  /**
   * @param {{app: import('@slack/bolt').App}} param1
   */
  render: async function ({ app }) {
    return (text = `<#C75M7C0SY> - Introduce yourself to the community here
<#C0266FRGV> - Meet new people here
<#C056WDR3MQR> - Free, powerful, and versatile compute infrastructure for all high school hackers!
<#C01504DCLVD> - Share awesome updates about your work-in-progess projects`);
  },
};
