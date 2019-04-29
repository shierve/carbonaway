import { Flow } from "../../models/flow.model";
import { BotLogic } from "../bot.logic";
import { bot } from "../../bot";
import { TravelLogic } from "../travel.logic";
import { formatCo2 } from "../helpers/format.helpers";
import { createPayment } from "../helpers/payment.helpers";
import { co2ToTrees, treesToDollars } from "../helpers/emissions.helpers";
import { OffsetFlow } from "./offset.flow";

export interface QueryState {
  total?: number;
  offsetAmount?: number;
  notOffsetAmount?: number;
  trees?: number;
}

export class QueryFlow implements Flow {

  public userId: string;
  public state: QueryState;

  constructor(userId: string, state?: QueryState ) {
    console.log(`new query flow for user ${userId}`);
    this.userId = userId;
    if (state) {
      this.state = state;
    } else {
      this.state = {};
    }
  }

  // Handles message events processed by wit
  public async process(message) {
    if (this.state.trees) {
      if (message.entities.agree && message.entities.agree[0].value === "yes") {
        await this.startOffset();
        return;
      } else {
        await BotLogic.callSendAPI(this.userId, `alright, maybe next time!`);
        await this.finalize();
        return;
      }
    }
    // console.log("interpreted message:", message);
    const period = message.entities.period[0].value;
    const emissions = await TravelLogic.getPeriodEmissions(this.userId, period!);
    this.state.total = emissions.total;
    this.state.offsetAmount = emissions.offset;
    this.state.notOffsetAmount = this.state.total! - this.state.offsetAmount!;
    this.state.trees = co2ToTrees(this.state.notOffsetAmount);
    await BotLogic.callSendAPI(this.userId, `you have emitted ${formatCo2(emissions.total)}kg of CO2, and you have offset ${formatCo2(emissions.offset)}g of CO2 this ${period}.`);
    if (this.state.trees >= 10) {
      await BotLogic.sendButton(this.userId, `Planting ${this.state.trees} trees would offset the remaining carbon footprint. Would you like to offset it?`, "http://google.com", "Offset!");
      const payment = await createPayment(this.userId, this.state.trees, treesToDollars(this.state.trees));
      console.log("payment -> ", payment.prototype);
      await this.store();
    } else {
      await this.finalize();
    }
  }

  public async startOffset() {
    const offsetFlow = new OffsetFlow(this.userId, {
      trees: this.state.trees,
      price: treesToDollars(this.state.trees!),
    });
    await this.finalize();
    await offsetFlow.initialize();
  }

  public async store() {
    const db = bot.mongo.db("environment");
    await db.collection("flows").updateOne({userId: this.userId}, {$set: {
      type: "query",
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

}
