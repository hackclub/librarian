module.exports = ({ app, client }) => {
    app.event("channel_created", async ({ event, body }) => {
        const channelId = event.channel.id;
        const userId = event.channel.creator;
        await app.client.conversations.join({
            channel: channelId,
        });
        await app.client.chat.postEphemeral({
            channel: channelId,
            user: userId,
            text: `Nice channel you got there. I'm librarian, which is created by HQ to help people find new and active channels. No message data is collected/stored, just how many messages are sent in a certain timeframe. If you do not want me in this channel and you do not want your channel in #directory, please run the command /optout-directory.`,
        });
    });
}