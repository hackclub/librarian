module.exports = {
  blockedChannels: [
    "C05G25Y9M6V", // #infra-alerts
    "CLU651WHY", // #orpheus-internals
    "CNMU9L92Q", // #confessions (reasons are obvious)
    "CCZ5LRL6P", // #politics (reasons are obvious)
    "C0159TSJVH8", // #what-is-my-slack-id
    "C077R6LC3C1", // #diredctory
    "CT0BV6UMV", // #confessions-meta,
    "C0188CY57PZ", // #meta
    "C01T5J557AA", // #ssh-chat-bridge (banned users use this)
    "C02GK2TVAVB", // #temp-email
    "C078Q8PBD4G", // #library
    "C029E8FARRC", // #minecraft-bridge

    // Here's a list of bot channels/spammy channels
    // This goes here in order to prevent the indexing of artificially inflated rankings
    "C0P5NE354",
    "C06QL7WMRLK",
    "C02HSS9Q3D5",
    "C06T9MYV543",
    "C077YSMMAPL",
    "C077SBH8C1L",
    "C078K46G9NU",
    "C071BTQFB17",
    "C05RETCS0EL",
    "C02T3CU03T3",
    "C02HSS9Q3D5",
    "C02B7CWDD0E",
    "C016DEDUL87",
    "C070Y7F0PDG",
    "C06SBHMQU8G", // arcade
    "C077TSWKER0", // arcade
  ],
  queries: {
    topThreads: `-is:dm is:thread -in:#arcade -in:#arcade-help -in:#arcade-lounge -in:#confessions -in:#meta -in:#scrapbook -in:#hackclub-leeks`,
    topChannels: `-is:dm -in:#arcade -in:#arcade-help -in:#arcade-lounge -in:#confessions -in:#meta -in:#scrapbook -in:#hackclub-leeks`,
  },
  channelEmojis: {
    C056AMWSFKJ: "⚙️",
  },
};
