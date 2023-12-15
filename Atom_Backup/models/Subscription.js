const { Schema, model } = require("mongoose");

const subscriptionSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
    },
    stripeSubcriptionId: {
      type: String,
      required: true,
    },
    planEndDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = subscriptionSchema;
