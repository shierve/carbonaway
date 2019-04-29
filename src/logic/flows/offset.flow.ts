import { Flow } from "../../models/flow.model";
import { BotLogic } from "../bot.logic";
import { bot } from "../../bot";
import { TravelLogic } from "../travel.logic";
import { formatCo2 } from "../helpers/format.helpers";
import { co2ToTrees } from "../helpers/emissions.helpers";

export interface OffsetState {
  trees?: number;
  price?: number;
}

export class OffsetFlow implements Flow {

  public userId: string;
  public state: OffsetState;

  constructor(userId: string, state: OffsetState ) {
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
    //
  }

  public async initialize() {
    await BotLogic.callSendAPI(this.userId, `Let's offset! The price for planting ${this.state.trees} trees is $${this.state.price}.`);
    await this.store();
  }

  public async store() {
    const db = bot.mongo.db("environment");
    await db.collection("flows").insertOne({
      type: "offset",
      userId: this.userId,
      state: this.state,
    });
  }

  public async finalize() {
    const db = bot.mongo.db("environment");
    await db.collection("flows").deleteMany({
      userId: this.userId,
    });
  }

}
