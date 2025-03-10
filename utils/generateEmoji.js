
/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}} param1
 */
module.exports = async function ({ app, id }) {
    const channel = await app.client.conversations.info({
        channel: id,
    });

    const response = await fetch('https://ai.hackclub.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: [
                {
                    role: 'system',
                    content: 'Your job is to respond with a singular emoji which represents a channel name. The next message will be the channel name and the description (if provided). Respond with one character, the emoji the name corresponds to.'
                },
                {
                    role: 'user',
                    content: `name: ${channel.channel.name}\ndescription: ${channel.channel.topic}`
                }
            ]
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;


}