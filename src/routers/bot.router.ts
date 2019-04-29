import { Request, Response, Router } from "express";
import { BotLogic } from "../logic/bot.logic";

export class BotRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.router.get("/", this.health);
    this.router.post("/webhook", this.postWebhook);
    this.router.get("/webhook", this.getWebhook);
  }

  public getRouter() {
    return this.router;
  }

  public async postWebhook(req: Request, res: Response): Promise<Response | void> {
    try {
      let body = req.body;

      // Checks this is an event from a page subscription
      if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(async (entry) => {

          // Gets the message. entry.messaging is an array, but
          // will only ever contain one message, so we get index 0
          let webhook_event = entry.messaging[0];
          await BotLogic.processMessage(webhook_event);
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
      } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
      }
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }

  public async getWebhook(req: Request, res: Response): Promise<Response | void> {
    try {
      // Your verify token. Should be a random string.
      let VERIFY_TOKEN = process.env.VERIFICATION_TOKEN;

      // Parse the query params
      let mode = req.query['hub.mode'];
      let token = req.query['hub.verify_token'];
      let challenge = req.query['hub.challenge'];

      // Checks if a token and mode is in the query string of the request
      if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

          // Responds with the challenge token from the request
          console.log('WEBHOOK_VERIFIED');
          res.status(200).send(challenge);

        } else {
          // Responds with '403 Forbidden' if verify tokens do not match
          res.sendStatus(403);
        }
      }
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }

  public async health(req: Request, res: Response): Promise<Response | void> {
    try {
      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }

}
