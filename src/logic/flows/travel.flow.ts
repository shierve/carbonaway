import rp = require("request-promise");
import { Flow } from "../../models/intent.model";
import { EmissionsLogic } from "../emissions.logic";
import { BotLogic } from "../bot.logic";

export class TravelFlow implements Flow {

  public userId: string;

  constructor(userId: string) {
    console.log(`new travel flow for user ${userId}`);
    this.userId = userId;
  }

  // Handles message events processed by wit
  public async process(message) {
    console.log("interpreted message:", message);
    const origin = message.entities.origin[0].value;
    const destination = message.entities.destination[0].value;
    const distance = await EmissionsLogic.getDistance(origin, destination);
    await BotLogic.callSendAPI(this.userId, `you traveled from ${origin} to ${destination}, with a distance of ${distance} km`);
  }

  public async finalize() {
    // TODO:
  }

}
