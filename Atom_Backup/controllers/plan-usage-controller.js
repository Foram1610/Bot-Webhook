require("dotenv").config();
const stripe = require("../utils/stripe");
const { getAccountCollection, getPlanUsageCollection } = require("../utils/tenancy/Tenancy");
const PaymentController = {
  // We should first create a stripe customer and than update it's payment method, so 2 API calls to Stripe here
  async createCustomerAndAttachPaymentMethod(req, res) { },

  async getCustomerPaymentMethod(req, res) {
    try {
      const fetchPaymentMethod = await stripe.fetchPaymentMethodById(
        req.query.paymentMethodId
      );
      res.ok({ data: fetchPaymentMethod });
    } catch (error) {
      res.failureResponse(error);
    }
  },

  // Customer should be allowed to update the preffered payment method
  async updateCustomerPaymentMethod(req, res) {
    try {
      const updatMethode = await stripe.updatePaymentMethod(
        req.body.customerId,
        req.body.updatedPaymentMethodId,
        req.body.existingPaymentMethodId
      );
      const AccountCollection = await getAccountCollection(req.query.tenantId);
      await AccountCollection.findOneAndUpdate(
        { tenantId: req.query.tenantId },
        { stripePaymentMethodId: req.body.updatedPaymentMethodId }
      );
      res.ok({ data: updatMethode });
    } catch (error) {
      res.failureResponse(error);
    }
  },

  //Update how many chats been answered in totalUsage. If usage goes beyond included in a plan, we should increase monthly bill
  async updateUsageMetrics(req, res) { },

  //Fetch Invoice of customer
  async getCustomerInvoice(req, res) {
    try {
      const customerInvoices = await stripe.fetchInvoices(req.query.customerId);
      res.ok({ data: customerInvoices });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  async getdataUsage(req, res) {
    try {
      const { tenantId } = req.query
      const PlanUsageModel = await getPlanUsageCollection(tenantId)
      const dataCount = await PlanUsageModel.find({})
      res.ok({ data: dataCount });
    } catch (error) {
      res.failureResponse(error);
    }
  },
};

module.exports = PaymentController;
