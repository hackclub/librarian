const Airtable = require("airtable");
require("dotenv").config();
const { App } = require("@slack/bolt");
const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(
    process.env.AIRTABLE_BASE,
);
const geolib = require("geolib");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const geoIp2 = require("geoip-lite2");
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,

  });
  
async function lookupCity(lat, lon) {
    const response = await (
        await fetch(
            "https://nominatim.openstreetmap.org/reverse?" +
            new URLSearchParams({
                lat,
                lon,
                format: "jsonv2",
            }),
        )
    ).json();
    if (response.error) return "Unknown city";
    else return response.display_name;
}

module.exports = async function (id, ip) {
    var u = null;
    if (id) {
        const user = await app.client.users.info({
            user: id
        });
        if (!user.user.profile.email)
            return `Sorry, I couldn't lookup your location. This appears to be an issue on our side. Tell an admin that the bot may not have been installed with the \`users:read.email\` scope.`;
        const tableIds = process.env.AIRTABLE_TABLES.split(",");
        

        for (const tableId of tableIds) {
            const table = await base(tableId)
                .select({
                    filterByFormula:
                        tableId == "tblLXcLHjzTy08IeK"
                            ? `fldwcOLKym9dRvKvW = "${user.user.profile.email}"`
                            : `fldFDUVB1h83LchKg = "${user.user.profile.email}"`,
                })
                .all();

            u = table.find(
                (record) =>
                    record.get("Email") == user.user.profile.email ||
                    record.get("Email Address") == user.user.profile.email,
            );
            if (u) {
                break;
            }
        }
    }
    if (!u?.get("IP") && !ip)
        return `Sorry, I couldn't lookup your location. This appears to be an issue on our side. Tell an admin that our system may have failed to record user information.`;

    var locations = [];
    const channels = await prisma.channel.findMany({
        where: {
            optout: false,
        },
    });
    const userRecord = await prisma.user.findFirst({
        where: {
            id,
        },
    });
    var lookup = geoIp2.lookup(u.get("IP") || ip);
    var location = lookup.ll;

    if (userRecord && userRecord.lat && userRecord.lon)
        location = [userRecord.lat, userRecord.lon];

    channels.forEach((channel) => {
        if (!channel.lat || !channel.lon || channel.optout) return;
        const distance = geolib.getPreciseDistance(
            {
                latitude: channel.lat,
                longitude: channel.lon,
            },
            {
                latitude: location[0],
                longitude: location[1],
            },
        );
        locations.push({
            km: geolib.convertDistance(distance, "km"),
            mi: geolib.convertDistance(distance, "mi"),
            id: channel.id,
        });
    });
    var filter = locations
        .sort((a, b) => a.km - b.km)
        .filter((a) => a.mi <= 350);
    if (filter.length > 2) locations = filter;
    else locations = locations.sort((a, b) => a.km - b.km).slice(0, 3);

    var text = !userRecord
        ? `I assumed you live in ${await lookupCity(location[0], location[1])} based on information based the IP address of when you joined Hack Club. If it's not correct, please set it manually using /setuserlocation [location]. Here are some channels with people near you:\n\n`
        : `Showing channels near \`${await lookupCity(location[0], location[1])}\`:\n\n`;

    locations.forEach(
        (loc) =>
            (text += `- <#${loc.id}> (${loc.mi.toFixed(2)} mi/${loc.km.toFixed(2)} km away)\n`),
    );

    if (locations.length < 1)
        text +=
            "There are no channels for Hack Clubbers near you. Go make one and invite people!";
    return text;

}
