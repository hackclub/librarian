# Sussy Location Services

SLS is a location service which helps Hack Clubbers find each other. It is only used by a few approved applications.

## Data Sources
- When you sign up for the Hack Club Slack, your IP address is stored. We can geocode your IP address into rough GPS coordinates, then we send those rough coordinates to [Nominatim](https://nominatim.org/), an open source geocoding service which uses OpenStreetMaps.
- You can give us a more accurate location by running the `/setuserlocation [location]` command, where we take that location and store it as GPS coordinates.
  - Note: You can be as specific (`15 Falls Rd, Shelburne, VT 05482, USA`) or as broad (`Chittenden County, VT`, `Vermont, USA`) as you want.
