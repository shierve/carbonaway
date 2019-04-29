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
}

export interface Offset {
  userId: string;
  timestamp: number;
  co2: number;
}

export class TravelLogic {

  public static async storeTravel(travel: Travel) {
    const db = bot.mongo.db("environment");
    await db.collection("travels").insertOne(travel);
  }

  public static async storeOffset(offset: Offset) {
    const db = bot.mongo.db("environment");
    await db.collection("offsets").insertOne(offset);
  }

  public static async getPeriodEmissions(userId: string, period: string) {
    const db = bot.mongo.db("environment");
    const startOfMonth = moment().startOf(period as moment.unitOfTime.StartOf).valueOf();
    const travels = await db.collection("travels").find({userId, timestamp: {$gte: startOfMonth}}).toArray();
    return travels.reduce((acc, v) => {
      return acc + v.co2;
    }, 0);
  }

  public static async getOffsetEmissions(userId: string, period: string) {
    const db = bot.mongo.db("environment");
    const startOfMonth = moment().startOf(period as moment.unitOfTime.StartOf).valueOf();
    const travels = await db.collection("offsets").find({userId, timestamp: {$gte: startOfMonth}}).toArray();
    return travels.reduce((acc, v) => {
      return acc + v.co2;
    }, 0);
  }

}
