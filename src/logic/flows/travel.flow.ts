import rp = require("request-promise");
import { Flow } from "../../models/flow.model";
import { BotLogic } from "../bot.logic";
import { bot } from "../../bot";
import { TravelLogic } from "../travel.logic";
import { formatDistance, formatCo2 } from "../helpers/format.helpers";
import { getDistance, getCo2FromDistanceAndVehicle } from "../helpers/emissions.helpers";

export interface TravelState {
  origin?: string;
  destination?: string;
  distance?: number;
  co2?: number;
  vehicle?: string;
}

export class TravelFlow implements Flow {

  public userId: string;
  public state: TravelState;

  constructor(userId: string, state?: TravelState ) {
    console.log(`new travel flow for user ${userId}, with state`, state);
    this.userId = userId;
    if (state) {
      this.state = state;
    } else {
      this.state = {};
    }
  }

  // Handles message events processed by wit
  public async process(message) {
    // console.log("interpreted message:", message);
    if (message.entities.origin) {
      console.log("add origin");
      this.state.origin = message.entities.origin[0].value;
    }
    if (message.entities.destination) {
      console.log("add destination");
      this.state.destination = message.entities.destination[0].value;
    }
    if (message.entities.vehicle) {
      console.log("add vehicle", message.entities.vehicle[0].value);
      this.state.vehicle = message.entities.vehicle[0].value;
    }
    if (this.isCompleted()) {
      await this.complete();
      await this.finalize();
    } else {
      await this.store();
      await this.continue();
    }
  }

  public async store() {
    const db = bot.mongo.db("environment");
    await db.collection("flows").updateOne({userId: this.userId}, {$set: {
      type: "travel",
      userId: this.userId,
      state: this.state,
    }}, {upsert: true});
  }

  public async finalize() {
    const db = bot.mongo.db("environment");
    await db.collection("flows").deleteMany({
      userId: this.userId,
    });
  }

  private isCompleted() {
    console.log("state:", this.state);
    return this.state.origin && this.state.destination && this.state.vehicle;
  }

  private async complete() {
    const distance = await getDistance(this.state.origin, this.state.destination);
    const co2 = getCo2FromDistanceAndVehicle(distance, this.state.vehicle!);
    await BotLogic.callSendAPI(this.userId, `you traveled from ${this.state.origin} to ${this.state.destination}, by ${this.state.vehicle}, a total distance of ${formatDistance(distance)} km, which emitted ${formatCo2(co2)}kg of co2 into the atmosphere`);
    await TravelLogic.storeTravel({
      userId: this.userId,
      timestamp: Date.now(),
      origin: this.state.origin!,
      destination: this.state.destination!,
      distance,
      co2,
      vehicle: this.state.vehicle!,
    });
  }

  private async continue() {
    if (!this.state.destination) {
      await BotLogic.callSendAPI(this.userId, `where did you go?`);
    } else if (!this.state.origin) {
      await BotLogic.callSendAPI(this.userId, `where did you leave from?`);
    } else if (!this.state.vehicle) {
      await BotLogic.callSendAPI(this.userId, `what vehicle did you travel with?`);
    }
  }

}
