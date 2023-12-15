const stripe = require("../utils/stripe");
const {
  getAccountCollection,
  getPlanUsageCollection,
  getPlanCollection,
  getSubscriptionCollection,
} = require("../utils/tenancy/Tenancy");

const planController = {
  async addPlans() {
    try {
      const stripePlans = await stripe.fetchAllPlans();
      let plans = [];
      for (let i = 0; i < 4; i++) {
        const element = stripePlans.data[i];
        const element1 = { ...element.metadata };
        delete element1.aiChatbots;
        delete element1.businessInsights;
        let features = {
          aiChatBots: element.metadata.aiChatbots.split("|"),
          businessInsights: element.metadata.businessInsights.split("|"),
        };
        let priceData = await stripe.fetchPriceById(element.default_price);
        let flatAmount = priceData.tiers[0].flat_amount / 100;
        plans.push({
          name: element.name,
          description: element.description,
          stripePlanId: element.id,
          features: features,
          monthlyPriceId: element.default_price,
          monthlyPrice: flatAmount,
          counters: element1,
        });
      }

      const PlanCollection = await getPlanCollection();
      for (let i = 0; i < plans.length; i++) {
        const element = plans[i];

        const isPlanFound = await PlanCollection.findOne({
          name: element.name,
        });
        if (isPlanFound?.name) {
          await PlanCollection.findOneAndUpdate(
            { _id: isPlanFound._id },
            { $set: element },
            { runValidators: true, upsert: true }
          );
        } else {
          const newPlan = new PlanCollection(element);
          await newPlan.save();
        }
      }
    } catch (error) {
      console.log(error);
    }
  },

  async getPlansList(req, res) {
    try {
      const PlanCollection = await getPlanCollection();
      const planData = await PlanCollection.find().sort("monthlyPrice");

      res.ok({ data: planData });
    } catch (error) {
      res.failureResponse(error);
    }
  },

  async purchaseSubscription(req, res) {
    try {
      const priceData = await stripe.fetchPriceById(req.body.priceId);
      const productData = await stripe.fetchPlanById(req.body.productId);
      const AccountCollection = await getAccountCollection(req.query.tenantId);
      const PlanUsageCollection = await getPlanUsageCollection(
        req.query.tenantId
      );
      const PlanCollection = await getPlanCollection();
      const SubscriptionCollection = await getSubscriptionCollection();

      let customerId, stripePaymentMethodId;

      const getPlanData = await PlanCollection.findOne({
        stripePlanId: req.body.productId,
      });

      //Deactive Free plan.
      await PlanUsageCollection.findOneAndUpdate(
        {
          totalMonthlyChats: 300,
        },
        { isActive: false }
      );

      const checkAccount = await AccountCollection.findOne({
        tenantId: req.query.tenantId,
      });
      if (!checkAccount.stripeCustomerId) {
        let stripeCustomerId = await stripe.createStripeCustomer(
          checkAccount.tenantName,
          req.email,
          req.body.paymentMethodId
        );
        customerId = stripeCustomerId.id;
      } else {
        customerId = checkAccount.stripeCustomerId;
        if (!checkAccount.stripePaymentMethodId) {
          const data = {
            invoice_settings: {
              default_payment_method: req.body.paymentMethodId,
            },
          };
          await stripe.updateCustomer(data, customerId);
        }
      }
      if (!checkAccount.stripePaymentMethodId) {
        stripePaymentMethodId = req.body.paymentMethodId;
      } else {
        stripePaymentMethodId = checkAccount.stripePaymentMethodId;
      }

      const subscription = await stripe.createSubscription(
        req.body.priceId,
        customerId,
        stripePaymentMethodId
      );

      if (checkAccount.stripeSubcriptionId) {
        const planUsageData = await PlanUsageCollection.findOne({
          stripeSubcriptionId: checkAccount.stripeSubcriptionId,
        });

        await stripe.cancelSubscription(
          planUsageData.stripeSubcriptionId,
          planUsageData.usedChats + planUsageData.meteredQuota
        );
        await PlanUsageCollection.findOneAndDelete({
          stripeSubcriptionId: planUsageData.stripeSubcriptionId,
        });

        await SubscriptionCollection.findOneAndDelete({
          stripeSubcriptionId: planUsageData.stripeSubcriptionId,
        });
      }

      await PlanUsageCollection.create({
        tenantId: req.query.tenantId,
        stripePlanId: productData.id,
        stripeSubcriptionId: subscription.subscription.id,
        planId: getPlanData._id,
        totalMonthlyChats: priceData.tiers[0].up_to,
        stripeCustomerId: customerId,
        planStartDate: new Date(
          subscription.subscription.current_period_start * 1000
        ),
        planEndDate: new Date(
          subscription.subscription.current_period_end * 1000
        ),
      });

      await AccountCollection.findOneAndUpdate(
        { tenantId: req.query.tenantId },
        {
          stripeCustomerId: customerId,
          stripePaymentMethodId: stripePaymentMethodId,
          subscription: priceData.recurring.interval,
          plan: productData.name,
          stripeSubcriptionId: subscription.subscription.id,
        }
      );

      await SubscriptionCollection.create({
        tenantId: req.query.tenantId,
        stripeSubcriptionId: subscription.subscription.id,
        planEndDate: new Date(
          subscription.subscription.current_period_end * 1000
        ),
      });

      res.ok();
    } catch (error) {
      res.failureResponse(error);
    }
  },

  async cancelSubscription(req, res) {
    try {
      const PlanUsageCollection = await getPlanUsageCollection(
        req.query.tenantId
      );
      const SubscriptionCollection = await getSubscriptionCollection();
      const AccountCollection = await getAccountCollection(req.query.tenantId);
      const getPlanUsageData = await PlanUsageCollection.findOne({
        tenantId: req.query.tenantId,
      });
      const cancelSubscription = await stripe.cancelSubscription(
        req.query.subscriptionId,
        getPlanUsageData.usedChats + getPlanUsageData.meteredQuota
      );

      await AccountCollection.findOneAndUpdate(
        {
          stripeSubcriptionId: req.query.subscriptionId,
        },
        {
          plan: "Free",
          stripeSubcriptionId: null,
        }
      );

      await PlanUsageCollection.findOneAndDelete({
        stripeSubcriptionId: req.query.subscriptionId,
      });
      await PlanUsageCollection.findOneAndUpdate(
        {
          totalMonthlyChats: 300,
        },
        { isActive: true }
      );

      await SubscriptionCollection.findOneAndDelete({
        stripeSubcriptionId: req.query.subscriptionId,
      });
      res.ok({ data: cancelSubscription });
    } catch (error) {
      res.failureResponse(error);
    }
  },
};

module.exports = planController;
