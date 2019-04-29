import { Flow } from "../../models/intent.model";

export class FlowFactory {

  private async findFlow(userId: string) {
    
  }

  public async getFlow(userId: string, message) {
    // find previous flow

    // if it is starter
    console.log("interpreted message:", message);
    const origin = message.entities.origin[0].value;
    const destination = message.entities.destination[0].value;
    const distance = await EmissionsLogic.getDistance(origin, destination);
    await BotLogic.callSendAPI(this.userId, `you traveled from ${origin} to ${destination}, with a distance of ${distance} km`);
  }

}
