const { Schema, model } = require("mongoose");

const planUsageSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
    },
    totalMonthlyChats: {
      type: Number,
      required: true,
      default: 300
    },
    usedChats: {
      type: Number,
      default: 0,
    },
    githubCount: {
      type: Number,
      default: 0,
    },
    fileCount: {
      type: Number,
      default: 0,
    },
    atlassianCount: {
      type: Number,
      default: 0,
    },
    websiteCount: {
      type: Number,
      default: 0,
    },
    meteredQuota: {
      type: Number,
      default: 0,
    },
    planId: {
      type: String,
    },
    stripePlanId: {
      type: String,
    },
    stripeSubcriptionId: {
      type: String,
    },
    stripeCustomerId: {
      type: String,
    },
    planStartDate: {
      type: Date,
    },
    planEndDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = planUsageSchema;
