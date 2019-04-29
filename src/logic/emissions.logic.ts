import rp = require("request-promise");

export class EmissionsLogic {

  // gets coordinates from a place by name (Google API)
  public static async getCoordinates(address: string) {
    const resp = await rp({
      method: "GET",
      uri: "https://maps.googleapis.com/maps/api/geocode/json",
      qs: {
        key: process.env.GOOGLE_API_KEY,
        address,
      },
      json: true,
    });
    return resp.results[0].geometry.location;
  }

  public static degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  public static distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371;

    const dLat = EmissionsLogic.degreesToRadians(lat2 - lat1);
    const dLon = EmissionsLogic.degreesToRadians(lon2 - lon1);

    lat1 = EmissionsLogic.degreesToRadians(lat1);
    lat2 = EmissionsLogic.degreesToRadians(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  public static async getDistance(l1, l2) {
    const c1 = await EmissionsLogic.getCoordinates(l1);
    const c2 = await EmissionsLogic.getCoordinates(l2);
    return this.distanceInKmBetweenEarthCoordinates(c1.lat, c1.lng, c2.lat, c2.lng);
  }

}
