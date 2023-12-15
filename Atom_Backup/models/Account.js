const { Schema } = require("mongoose");
const apischema = require("./ApiKey");

const accountSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
    },
    tenantName: {
      type: String,
      required: true,
    },
    aiConfig: {
      type: Object,
      required: false,
    },
    stripeCustomerId: {
      type: String,
      required: false,
    },
    plan: {
      type: String,
      default: "Free",
    },
    subscription: {
      type: String,
      default: "Monthly",
      enum: ["Monthly", "Yearly"],
    },
    stripePaymentMethodId: {
      type: String,
    },
    stripeSubcriptionId: {
      type: String,
    },
    webhook: {
      type: String,
      required: false,
    },
    apiKeys: [apischema],
  },
  { timestamps: true }
);

module.exports = accountSchema;
