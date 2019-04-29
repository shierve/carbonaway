import express = require("express");
import bodyParser = require("body-parser");
import { BotRouter } from "./routers/bot.router";
import { MongoClient } from "mongodb";
class Bot {
  public server: express.Express;
  public mongo: MongoClient;

  constructor() {}

  public async start() {
    try {
      this.mongo = await MongoClient.connect(process.env.DB_URI!, {useNewUrlParser: true});
      this.server = await express();
      this.server.use(bodyParser.json());
      this.server.use(bodyParser.urlencoded({ extended: true }));
      this.server.use("/", new BotRouter().getRouter());
      this.server.listen(3000, (_) => {
        console.log("Listening on port 3000");
      });
    } catch (err) {
      throw err;
    }
  }
}

const bot = new Bot();
export { bot };
