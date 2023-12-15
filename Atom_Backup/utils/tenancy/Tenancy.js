const { getModelByTenant } = require("./connection-controller");
const { mongodb } = require("./index");
const accountSchema = require("../../models/Account");
const botSchema = require("../../models/Bot");
const messageSchema = require("../../models/Message");
const userSchema = require("../../models/User");
const planUsageSchema = require("../../models/PlanUsage");
const planSchema = require("../../models/Plan");
const subscriptionSchema = require("../../models/Subscription");

const schemas = [
  { modelName: "Account", schema: accountSchema },
  { modelName: "Message", schema: messageSchema },
  { modelName: "User", schema: userSchema },
  { modelName: "PlanUsage", schema: planUsageSchema },
];
/**
 * This function creates a database and register the schemas once ther user signs up for the first time
 */

const createTenantDB = async (tenantId, data) => {
  try {
    const AccountModel = await getAccountCollection(tenantId);
    const PlanUsageModel = await getPlanUsageCollection(tenantId);
    const { tenantID, tenantName } = data;
    const newAccount = await AccountModel.create({
      tenantId: tenantID,
      tenantName: tenantName,
    });
    const currentDate = new Date();
    await PlanUsageModel.create({
      tenantId: tenantID,
      planStartDate: new Date(),
      planEndDate: new Date(currentDate.setMonth(currentDate.getMonth() + 1)),
    });
    if (mongodb) {
      const useDB = mongodb.useDb(tenantId, { useCache: true });
      schemas.forEach((schema) => {
        useDB.model(schema.modelName, schema.schema);
      });
    }
    return newAccount;
  } catch (error) {
    console.log(error);
  }
};
/**
 * these functions retireve collections based on tenantID and use them in our API'S
 */
const getAccountCollection = async (tenantId) => {
  const AccountModel = getModelByTenant(tenantId, "Account", accountSchema);
  return AccountModel;
};
const getUserCollection = async (tenantId) => {
  const UserModel = getModelByTenant(tenantId, "User", userSchema);
  return UserModel;
};
const getMessageCollection = async (tenantId) => {
  const MessageModel = getModelByTenant(tenantId, "Message", messageSchema);
  return MessageModel;
};

const getPlanUsageCollection = async (tenantId) => {
  const planUsageModel = getModelByTenant(tenantId, "PlanUsage", planUsageSchema);
  return planUsageModel;
};
const getSubscriptionCollection = async (tenantId) => {
  const SubscriptionModel = getModelByTenant(tenantId, "Subscriptions", subscriptionSchema);
  return SubscriptionModel;
};
const getPlanCollection = async () => {
  const planUsageModel = getModelByTenant("Plan", "Plan", planSchema);
  return planUsageModel;
};
const getBotCollection = async () => {
  const BotModel = getModelByTenant("Bots", 'Bots', botSchema);
  return BotModel;
};

module.exports = {
  createTenantDB,
  getAccountCollection,
  getMessageCollection,
  getPlanCollection,
  getUserCollection,
  getBotCollection,
  getPlanUsageCollection,
  getSubscriptionCollection,
};
