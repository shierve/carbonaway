import { bot } from "../bot";

export interface Travel {
  timestamp: number;
  origin: string;
  destination: string;
  distance: number;
  co2: number;
  vehicle: string;
  offset?: boolean;
}

export class TravelLogic {

  public static async storeTravel(travel: Travel) {
    const db = bot.mongo.db("environment");
    await db.collection("travels").insertOne(travel);
  }

  public static async getMonthlyEmissions(userId: string) {
    const db = bot.mongo.db("environment");
    const travels = await db.collection("travels").find({userId}).toArray();
    return travels.reduce((acc, v) => {
      acc.total += v.co2;
      if (acc.offset) { acc.offset += v.co2; }
    }, {total: 0, offset: 0});
  }

}
