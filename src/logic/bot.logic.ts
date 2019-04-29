import rp = require("request-promise");

export class BotLogic {

  // Handles messages events
  public static async processMessage(event) {
    console.log(`received event: `, event);
    await BotLogic.callSendAPI(event.sender.id, "hello world!");
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
      json: true, // Automatically stringifies the body to JSON
    });
  }

}
