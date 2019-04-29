import rp = require("request-promise");

// gets coordinates from a place by name (Google API)
export const getCoordinates = async (address: string) => {
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
};

export const degreesToRadians = (degrees) => {
  return degrees * Math.PI / 180;
};

export const distanceInKmBetweenEarthCoordinates = (lat1, lon1, lat2, lon2) => {
  const earthRadiusKm = 6371;

  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const getDistance = async (l1, l2) => {
  const c1 = await getCoordinates(l1);
  const c2 = await getCoordinates(l2);
  return this.distanceInKmBetweenEarthCoordinates(c1.lat, c1.lng, c2.lat, c2.lng);
};

export const getCo2FromDistanceAndVehicle = (distance: number, vehicle: string) => {
  switch (vehicle) {
    case "plane": {
      return distance * 115;
    }
    case "car": {
      return distance * 251;
    }
    case "train": {
      return 0;
    }
    default:
      throw new Error("vehicle not implemented");
  }
};

export const co2ToTrees = (kgCo2: number) => {
  console.log("transform ", kgCo2);
  return Math.ceil(kgCo2 / 100);
};
