const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Function to extract emoji from text or return fallback
function extractEmojiOrFallback(text) {
  if (!text) return '💀';
  
  // If it's already a single character (likely an emoji), keep it
  if (text.length === 1) return text;
  
  // Check if it's a Slack emoji format (:emoji_name:)
  const slackEmojiRegex = /^:[a-zA-Z0-9_+-]+:$/;
  if (slackEmojiRegex.test(text)) {
    return text; // Keep Slack emoji notation
  }
  
  // Regular expression to match emoji characters
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]/gu;
  
  const matches = text.match(emojiRegex);
  
  // If we found emojis, return the first one
  if (matches && matches.length > 0) {
    return matches[0];
  }
  
  // No emoji found, return skull emoji
  return '💀';
}

async function main() {
  console.log("Starting emoji cleanup...");
  
  // Find channels where emoji field has more than 1 character (non-emoji text)
  const channelsToFix = await prisma.channel.findMany({
    where: {
      emoji: {
        not: null
      }
    }
  });
  
  console.log(`Found ${channelsToFix.length} channels with emoji data`);
  
  // Filter channels that need fixing (emoji field has more than 1 character)
  const channelsNeedingFix = channelsToFix.filter(channel => 
    channel.emoji && channel.emoji.length > 1
  );
  
  console.log(`${channelsNeedingFix.length} channels need emoji cleanup`);
  
  const BATCH_SIZE = 20; // Small batch size to respect connection pool limits
  let updatedCount = 0;
  
  // Process channels in batches
  for (let i = 0; i < channelsNeedingFix.length; i += BATCH_SIZE) {
    const batch = channelsNeedingFix.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(channelsNeedingFix.length / BATCH_SIZE)} (${batch.length} channels)...`);
    
    // Prepare batch update operations
    const updateOperations = batch.map(channel => {
      const originalEmoji = channel.emoji;
      const cleanedEmoji = extractEmojiOrFallback(originalEmoji);
      
      console.log(`Channel ${channel.name}: "${originalEmoji}" -> "${cleanedEmoji}"`);
      
      return prisma.channel.update({
        where: { id: channel.id },
        data: { emoji: cleanedEmoji }
      });
    });
    
    // Execute all updates in the batch concurrently
    await Promise.all(updateOperations);
    updatedCount += batch.length;
    
    console.log(`Batch completed. Total updated so far: ${updatedCount}`);
    
    // Small delay to prevent overwhelming the database
    if (i + BATCH_SIZE < channelsNeedingFix.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`\nCompleted! Updated ${updatedCount} channels total.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
