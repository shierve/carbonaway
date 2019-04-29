import rp = require("request-promise");

export class NLPLogic {

  // Returns wit.ai response from query string
  public static async interpret(message: string) {
    return await rp({
      method: "GET",
      uri: "https://api.wit.ai/message?v=20190429",
      qs: {
        q: message,
      },
      headers: {
        Authorization: "Bearer " + process.env.WIT_AUTH,
      },
      json: true,
    });
  }

}
