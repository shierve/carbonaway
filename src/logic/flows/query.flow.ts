import { Flow } from "../../models/flow.model";
import { BotLogic } from "../bot.logic";
import { bot } from "../../bot";
import { TravelLogic } from "../travel.logic";
import { formatCo2 } from "../format.helpers";

export interface QueryState {
  period?: string;
  startTime?: number;
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
    // console.log("interpreted message:", message);
    this.state.period = message.entities.period[0].value;
    const emissions = await TravelLogic.getPeriodEmissions(this.userId, this.state.period!);
    await BotLogic.callSendAPI(this.userId, `you have emitted ${formatCo2(emissions.total)}kg of CO2, and you have offset ${formatCo2(emissions.offset)}g of CO2 this ${this.state.period}`);
  }

  public async store() {
    // unimplemented
  }

  public async finalize() {
    // unimplemented
  }

}
