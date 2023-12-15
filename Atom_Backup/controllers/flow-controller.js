const { getBotCollection } = require("../utils/tenancy/Tenancy")

const flowController = {
  async createFlow(req, res) {
    try {
      console.log(req.body.pairs)

      const { tenantId } = req.query
      const { botId } = req.params;
      const BotCollection = await getBotCollection();
      if (!BotCollection) return res.recordNotFound()

      const bot = await BotCollection.findOneAndUpdate(
        { _id: botId, tenantId: tenantId },
        { $addToSet: { flow: req.body } },
        { runValidators: true, new: true }
      );

      res.created({ data: bot })
    } catch (error) {
      res.failureResponse(error)
    }
  },

  async updateFlow(req, res) {
    try {

      const { tenantId } = req.query
      const { botId, flowId } = req.params;
      const BotCollection = await getBotCollection();
      if (!BotCollection) return res.recordNotFound()
      const bot = await BotCollection.findOneAndUpdate(
        { _id: botId, "flow._id": flowId, tenantId: tenantId },
        { $set: { flow: req.body } },
        { runValidators: true, upsert: true }
      );

      res.ok({ data: bot })
    } catch (error) {
      res.failureResponse(error)
    }
  },
};

module.exports = flowController;
