require("dotenv").config();
const { Telegraf } = require("telegraf");

class AtomBot {
  constructor(token) {
    this.bot = new Telegraf(token);
  }

  getBot() {
    return this.bot;
  }
}

module.exports = AtomBot;
