# Sussy Location Services

SLS is a location service which helps Hack Clubbers find each other. It is only used by a few approved applications.

## Data Sources
- When you sign up for the Hack Club Slack, your IP address is stored. We can geocode your IP address into rough GPS coordinates, then we send those rough coordinates to [Nominatim](https://nominatim.org/), an open source geocoding service which uses OpenStreetMaps.
  - Librarian/SLS doesn't store your IP address. That is stored in Airtable.
  - [Hack Club's offical data policy is stored here.](https://github.com/hackclub/chronicle/blob/main/DATA_POLICY.md)
- You can give us a more accurate location by running the `/setuserlocation [location]` command, where we take that location and store it as GPS coordinates.
  - Note: You can be as specific (`15 Falls Rd, Shelburne, VT 05482, USA`) or as broad (`Chittenden County, VT`, `Vermont, USA`) as you want.

## What is stored/accessed by SLS
- Your IP address
- Your latitude and longitude

## How do I request my data is deleted?
- You can set your location to something random, like HQ's office and it will immediately overwrite your latitude and longitude, such as `/setuserlocation Shelburne, VT` (where Hack Club's in-person office is)
- For your IP address, ask hcb@hackclub.com to remove/scramble your record from the Airtable base claled "Slack Join Requests"

