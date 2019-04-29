import { bot } from "../bot";
import moment = require("moment");

export interface Travel {
  userId: string;
  timestamp: number;
  origin: string;
  destination: string;
  distance: number;
  co2: number;
  vehicle: string;
  // offset?: boolean;
}

export class TravelLogic {

  public static async storeTravel(travel: Travel) {
    const db = bot.mongo.db("environment");
    await db.collection("travels").insertOne(travel);
  }

  public static async getPeriodEmissions(userId: string, period: string) {
    const db = bot.mongo.db("environment");
    const startOfMonth = moment().startOf(period as moment.unitOfTime.StartOf).valueOf();
    console.log("greater than", startOfMonth);
    console.log("uid", userId);
    const travels = await db.collection("travels").find({userId, timestamp: {$gte: startOfMonth}}).toArray();
    console.log("travels:", travels);
    return travels.reduce((acc, v) => {
      return acc + v.co2;
    }, 0);
  }

}
