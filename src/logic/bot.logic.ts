import rp = require("request-promise");
import { NLPLogic } from "./nlp.logic";
import { TravelFlow } from "./flows/travel.flow";

export class BotLogic {

  // Handles messages events
  public static async processMessage(event) {
    console.log(`received event: `, event);
    const sender = event.sender.id;
    const wit = await NLPLogic.interpret(event.message.text);
    console.log("wit interpreted object:", wit);
    if (!wit.entities || !wit.entities.intent) {
      console.log("received message with no intent");
      await BotLogic.callSendAPI(sender, "I did not understand that");
      return;
    }
    const intent = wit.entities.intent[0].value;
    switch (intent) {
      case "communicate_travel": {
        const flow = new TravelFlow(sender);
        await flow.process(wit);
        break;
      }
      default: {
        await BotLogic.callSendAPI(sender, "Sorry I did not get your intent");
      }
    }
  }

  // Handles messaging_postbacks events
  public static async handlePostback(senderId, postback) {
    //
  }

  // Sends response messages via the Send API
  public static async callSendAPI(recipientId: string, message: string) {
    const headers = {
      "Content-Type": "application/json",
    };
    const resp = await rp({
      method: "POST",
      uri: "https://graph.facebook.com/v2.6/me/messages",
      body: {
        recipient: {
          id: recipientId,
        },
        message: {
          text: message,
        },
      },
      qs: {
        access_token: process.env.ACCESS_TOKEN,
      },
      headers,
      json: true,
    });
  }

}
