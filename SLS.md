# Sussy Location Services (SLS)

SLS is a location-based service designed to help Hack Clubbers connect with each other. It’s only accessible to a few approved applications, so your data is secured at all times

## Data Sources
- When you sign up for Hack Club's Slack, your IP address is stored. We can convert this IP address into approximate GPS coordinates and send them to [Nominatim](https://nominatim.org/), an open-source geocoding service powered by OpenStreetMaps.
  - Note: Neither Librarian nor SLS stores your IP address. It is saved in Airtable.
  - [You can view Hack Club’s official data policy here.](https://github.com/hackclub/chronicle/blob/main/DATA_POLICY.md)
- You can provide a more precise location by using the `/setuserlocation [location]` command. We will then store your location as GPS coordinates.
  - You can choose how specific or general your location is, whether it’s detailed (`15 Falls Rd, Shelburne, VT 05482, USA`) or broad (`Chittenden County, VT`, or just `Vermont, USA`).

## What Does SLS Store or Access?
- Your IP address
- Your latitude and longitude

## How Can I Request Data Deletion?
- To remove your location, you can simply overwrite it by setting a new one, like Hack Club’s HQ location. For example, you could run `/setuserlocation Shelburne, VT`, which would replace your current latitude and longitude.
- To delete or scramble your IP address, email hcb@hackclub.com and request removal from the Airtable base titled “Slack Join Requests.”
