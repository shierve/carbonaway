import { Flow } from "../../models/flow.model";
import { bot } from "../../bot";
import { TravelFlow } from "./travel.flow";
import { QueryFlow } from "./query.flow";
import { OffsetFlow } from "./offset.flow";

export class FlowFactory {

  public static isFlowStarter(intent: string) {
    return [
      "communicate_travel",
      "query",
      "communicate_offset",
    ].includes(intent);
  }

  public static async getFlow(userId: string, intent: string): Promise<Flow> {
    // find previous flow
    const previousFlow = await FlowFactory.findFlow(userId);
    console.log("prev flow:", previousFlow);
    if (previousFlow && intent === "communicate_travel" && previousFlow.type === "travel") {
      console.log("----------------");
      intent = "info";
    }
    // if it is starter
    if (FlowFactory.isFlowStarter(intent)) {
      await FlowFactory.deleteFlow(userId);
      switch (intent) {
        case "communicate_travel": {
          return new TravelFlow(userId);
        }
        case "query": {
          return new QueryFlow(userId);
        }
        case "communicate_offset": {
          return new OffsetFlow(userId);
        }
        default: {
          throw new Error("intent not implemented");
        }
      }
    } else {
      if (!previousFlow) {
        throw new Error("no flow in progress");
      }
      switch (previousFlow.type) {
        case "travel": {
          return new TravelFlow(userId, previousFlow.state);
        }
        case "offset": {
          return new OffsetFlow(userId, previousFlow.state);
        }
        case "query": {
          return new QueryFlow(userId, previousFlow.state);
        }
        default: {
          throw new Error("intent not implemented");
        }
      }
    }
  }

  private static async findFlow(userId: string) {
    const db = bot.mongo.db("environment");
    const flow = await db.collection("flows").findOne({userId});
    return flow;
  }

  private static async deleteFlow(userId: string) {
    const db = bot.mongo.db("environment");
    await db.collection("flows").deleteMany({userId});
  }

}
