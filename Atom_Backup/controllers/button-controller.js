const mongoose = require("mongoose");
const AtomBot = require("../controllers/classes/Telegram/Bot");
const { getBotCollection } = require("../utils/tenancy/Tenancy")

const buttonController = {
  async getAllButtonsInBot(req, res) {
    try {
      const { tenantId } = req.query
      const { botId } = req.params;
      const BotCollection = await getBotCollection();
      if (!BotCollection) return res.recordNotFound()
      const bot = await BotCollection.findById(new mongoose.Types.ObjectId(botId));

      res.ok({ data: bot ? bot.buttons : [] });
    } catch (error) {
      res.failureResponse(error);
    }
  },

  async createButton(req, res) {
    try {
      console.log(req.body)
      const { tenantId } = req.query
      const { botId } = req.params;
      const BotCollection = await getBotCollection();
      if (!BotCollection) return res.recordNotFound()
      const bot = await BotCollection.findOneAndUpdate(
        { _id: botId, tenantId: tenantId },
        { $addToSet: { buttons: req.body } },
        { runValidators: true, new: true }
      );
      const botInstance = new AtomBot(req.body.botToken);
      const bots = botInstance.bot;
      const botData = await BotCollection.findOne({ botToken: req.body.botToken, tenantId: tenantId });

      let commands = [];
      for (const command of botData.buttons) {
        commands.push({
          command: command.name.replace(/\s/g, "") || "",
          description: command.name || "data",
        });
      }
      bots.telegram.setMyCommands(commands);

      if (botData.buttons.length < 1) {
        bot.telegram.deleteMyCommands();
      }

      res.created({ data: bot });
    } catch (error) {
      res.failureResponse(error);
    }
  },

  async deleteButton(req, res) {
    try {
      const { tenantId } = req.query
      const { buttonId, botId, botToken } = req.params;
      const BotCollection = await getBotCollection();
      if (!BotCollection) return res.recordNotFound()
      const bot = await BotCollection.findOneAndUpdate(
        { _id: botId, tenantId: tenantId },
        { $pull: { buttons: { _id: buttonId } } },
        { runValidators: true, new: true }
      );
      const botInstance = new AtomBot(botToken);
      const bots = botInstance.bot;
      if (bot.buttons.length < 1) {
        bots.telegram.deleteMyCommands();
      }

      res.ok();
    } catch (error) {
      res.failureResponse(error);
    }
  },

  async updateButton(req, res) {
    try {
      const { tenantId } = req.query
      const { buttonId, botId } = req.params;
      const { botToken } = req.body
      const BotCollection = await getBotCollection();
      if (!BotCollection) return res.recordNotFound()
      const updateButtons = await BotCollection.findOneAndUpdate(
        { _id: botId, "buttons._id": buttonId, tenantId: tenantId },
        {
          $set: {
            "buttons.$.name": req.body.name,
            "buttons.$.config": req.body.config,
          },
        },
        { runValidators: true, new: true }
      );
      const updatedBot = await BotCollection.findOne({ botToken: botToken })
      const botInstance = new AtomBot(botToken);
      const bot = botInstance.bot;
      const commands = updatedBot.buttons.map(command => ({
        command: command.name.replace(/\s/g, "") || "",
        description: command.name || "data",
      }));

      // Set the bot's Telegram commands using the commands array
      bot.telegram.setMyCommands(commands);
      res.ok({ data: updateButtons });
    } catch (error) {
      res.failureResponse(error);
    }
  },

};

module.exports = buttonController;
