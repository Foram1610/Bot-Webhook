const CronJob = require("node-cron");
const Account = require("../models/Account");
const {
  getSubscriptionCollection,
  getPlanUsageCollection,
} = require("../utils/tenancy/Tenancy");
const { addTagToCustomer } = require("./email-controller");
const stripe = require("../utils/stripe");
const CronJobs = {
  async cron() {
    CronJob.schedule("0 9 * * *", async function () {
      //notify user
      const notifyAfter = new Date();
      notifyAfter.setDate(notifyAfter.getDate() - 10);

      const notifyBefore = new Date();
      notifyBefore.setDate(notifyBefore.getDate() - 9);
      console.log(notifyAfter, notifyBefore);
      const notifyAccounts = await Account.find({
        plan: "Free",
        createdAt: { $gte: notifyAfter, $lt: notifyBefore },
      });
      for (const account of notifyAccounts) {
        const data = {
          email: account.email,
          tag: "free_trial_expiration_warning",
        };
        await addTagToCustomer(data);
      }
      // delete user
      const deleteAfter = new Date();
      deleteAfter.setDate(deleteAfter.getDate() - 14);

      const deleteBefore = new Date(deleteAfter);
      deleteBefore.setDate(deleteBefore.getDate() + 1);

      const deleteAccounts = await Account.deleteMany({
        plan: "Free",
        createdAt: { $gte: deleteBefore, $lte: deleteAfter },
      });
    });
  },
  async invoiceCronJob() {
    try {
      let currentMonth = new Date().getMonth() + 1;
      let currentDate = new Date().getDate();
      if (currentMonth === 13) {
        currentMonth = 1;
      }
      const SubscriptionCollection = await getSubscriptionCollection();
      const getSubscriptions = await SubscriptionCollection.find();
      let invoiceData = [];
      for (let i = 0; i < getSubscriptions.length; i++) {
        const element = getSubscriptions[i];
        if (
          element.planEndDate.getDate() === currentDate &&
          element.planEndDate.getMonth() === currentMonth
        ) {
          invoiceData.push(element);
        }
      }
      console.log("===========Invoice Cron_Job===========");
      CronJob.schedule(
        `50 23 * * *`,
        async function () {
          for (let i = 0; i < invoiceData.length; i++) {
            const element = invoiceData[i];
            const PlanUsageCollection = await getPlanUsageCollection(
              element.tenantId
            );
            let getPlanUsageData = await PlanUsageCollection.findOne({
              stripeSubcriptionId: element.stripeSubcriptionId,
            });
            let subscriptionData = await stripe.fetchSubsciptionById(
              element.stripeSubcriptionId
            );
            const usageRecords = await stripe.createUsageRecord(
              subscriptionData.items.data[0].id,
              getPlanUsageData.usedChats + getPlanUsageData.meteredQuota
            );
            function addMonths(date, months) {
              date.setMonth(date.getMonth() + 1 + months);
              return date;
            }
            const endDate = addMonths(
              new Date(usageRecords.timestamp * 1000),
              1
            );
            await PlanUsageCollection.findOneAndUpdate(
              {
                stripeSubcriptionId: element.stripeSubcriptionId,
              },
              {
                usedChats: 0,
                meteredQuota: 0,
                planStartDate: new Date(usageRecords.timestamp * 1000),
                planEndDate: endDate,
              }
            );

            await SubscriptionCollection.findOneAndUpdate(
              { stripeSubcriptionId: element.stripeSubcriptionId },
              { planEndDate: endDate }
            );
          }
          console.log("===========Invoices Generated===========");
        }
      );
    } catch (error) {
      console.log(error);
    }
  },
};

module.exports = CronJobs;
