// const { getUserCollection, getBotCollection } = require("../utils/Tenancy/Tenancy")
const { getUserCollection, getBotCollection } = require("../utils/tenancy/Tenancy")
const usersController = {
  async getallUsersByAccount(req, res) {
    try {
      const { tenantId } = req.query
      const UserCollection = await getUserCollection(tenantId);
      if (!UserCollection) return res.recordNotFound()
      const users = await UserCollection.find({ tenantId: tenantId });


      res.ok({ data: users ?? [] });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  async getCountUsers(req, res) {
    try {
      const { tenantId } = req.query
      const UserCollection = await getUserCollection(tenantId);
      if (!UserCollection) return res.recordNotFound()

      const usersCount = await UserCollection.aggregate([
        {
          $match: {
            tenantId: tenantId,
            createdAt: {
              $gte: new Date(parseInt(req.query.from)),
              $lte: new Date(parseInt(req.query.to)),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%m/%d/%Y",
                date: "$createdAt",
              },
            },
            total: { $sum: 1 },
          },
        },
        {
          $project: {
            when: "$_id",
            total: 1,
            _id: 0,
          },
        },
      ]);

      const count = await UserCollection.countDocuments({
        createdAt: {
          $gte: new Date(parseInt(req.query.from)),
          $lte: new Date(parseInt(req.query.to)),
        },
        tenantId: tenantId,
      });

      res.ok({ data: { count: usersCount ?? [], users: usersCount ?? [] } });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  async getallUsersbyBot(req, res) {
    try {
      const { tenantId } = req.query
      const { botID } = req.params;
      const UserCollection = await getUserCollection(tenantId);
      if (!UserCollection) return res.recordNotFound()

      const users = await UserCollection.find({ botId: botID });
      res.ok({ data: users ?? [] });
    } catch (error) {
      res.failureResponse(error);
    }
  },
};

module.exports = usersController;
