const { getBotCollection } = require("../utils/tenancy/Tenancy")

const labelController = {
  async getAllLabelsInAccount(req, res) {
    try {
      const { tenantId } = req.query
      const BotsCollection = await getBotCollection();
      if (!BotsCollection) return res.recordNotFound()
      const bots = await BotsCollection.find({ tenantId: tenantId });
      const labels = bots.reduce((acc, curr) => {
        return [...acc, ...curr.labels];
      }, []);

      res.ok({ data: labels });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  async createLabel(req, res) {
    try {
      const { tenantId } = req.query
      const { botId } = req.params;
      const BotsCollection = await getBotCollection();
      if (!BotsCollection) return res.recordNotFound()
      const bot = await BotsCollection.findOneAndUpdate(
        { _id: botId, tenantId: tenantId },
        { $addToSet: { labels: req.body } },
        { runValidators: true, new: true }
      );

      res.created({ data: bot });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  async updateLabel(req, res) {
    try {
      const { tenantId } = req.query
      const { labelId, botId } = req.params;
      const BotsCollection = await getBotCollection();
      if (!BotsCollection) return res.recordNotFound()
      const bot = await BotsCollection.findOneAndUpdate(
        { _id: botId, "labels._id": labelId, tenantId: tenantId },
        { $set: { labels: req.body } },
        { runValidators: true, upsert: true }
      );

      res.ok({ data: bot });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  async deleteLabel(req, res) {
    try {
      const { tenantId } = req.query
      const { labelId, botId } = req.params;
      const BotsCollection = await getBotCollection();
      if (!BotsCollection) return res.recordNotFound()
      const bot = await BotsCollection.findOneAndUpdate(
        { _id: botId, tenantId: tenantId },
        { $pull: { labels: { _id: labelId } } },
        { runValidators: true, new: true }
      );

      res.ok({ data: bot });
    } catch (error) {
      res.failureResponse(error);
    }
  },
};

module.exports = labelController;
