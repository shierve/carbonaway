import { Flow } from "../../models/flow.model";
import { BotLogic } from "../bot.logic";
import { bot } from "../../bot";
import { treesToDollars, treesToCo2 } from "../helpers/emissions.helpers";
import { TravelLogic } from "../travel.logic";
import { formatCo2 } from "../helpers/format.helpers";

export interface OffsetState {
  trees?: number;
  price?: number;
  co2?: number;
}

export class OffsetFlow implements Flow {

  public userId: string;
  public state: OffsetState;

  constructor(userId: string, state?: OffsetState ) {
    console.log(`new offset flow for user ${userId}`);
    this.userId = userId;
    if (state) {
      this.state = state;
    } else {
      this.state = {};
    }
  }

  // Handles message events processed by wit
  public async process(message) {
    this.state.trees = Number(message.entities.trees[0].value);
    this.state.price = treesToDollars(this.state.trees);
    this.state.co2 = treesToCo2(this.state.trees);
    await this.storeOffset();
    await BotLogic.callSendAPI(this.userId, `Congratulations! You have offset ${formatCo2(this.state.co2)}kg of CO2 🌱🥳🌿`);
    await this.finalize();
  }

  public async store() {
    const db = bot.mongo.db("environment");
    await db.collection("flows").updateOne({userId: this.userId}, {$set: {
      type: "offset",
      userId: this.userId,
      state: this.state,
    }}, {upsert: true});
  }

  public async storeOffset() {
    await TravelLogic.storeOffset({
      userId: this.userId,
      timestamp: Date.now(),
      co2: this.state.co2!,
    });
  }

  public async finalize() {
    const db = bot.mongo.db("environment");
    await db.collection("flows").deleteMany({
      userId: this.userId,
    });
  }

}
