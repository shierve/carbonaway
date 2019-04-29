import { bot } from "../bot";

export interface Travel {
  origin: string;
  destination: string;
  distance: number;
  co2?: number;
  vehicle?: string;
}

export class TravelLogic {

  public static async storeTravel(travel: Travel) {
    const db = bot.mongo.db("environment");
    const flow = await db.collection("travels").insertOne(travel);
    return flow;
  }

}
