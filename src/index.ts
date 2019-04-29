import { bot } from "./bot";

// tslint:disable-next-line:no-var-requires
require("dotenv").config();

try {
  bot.start();
} catch (err) {
  throw err;
}
