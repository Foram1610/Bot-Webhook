require("dotenv").config();
const { get } = require("lodash");
const axios = require("axios");

const emailController = {
  async sendWelcomeEmail(emailAddress, name) {
    try {
      console.log("Sending welcome email to customer");
      const request = axios.post(
        "https://hook.eu1.make.com/weudjh98lanndw4a11um27b77150r1d6",
        {
          email: emailAddress,
          name: name,
        }
      );
    } catch (error) {
      console.log(error)
    }

  },
  async createJIRA(req, res) {
    try {
      const data = req.body
      console.log("Creating JIRA for the customer");
      const request = axios.post(
        "https://hook.eu1.make.com/lpossvn2txqhs7mddwspooktto24oiz6",
        {
          companyName: get(data, "companyName", ""),
          email_address: get(data, "email_address", ""),
          description: get(data, "description", ""),
        }
      );

      res.created()
    } catch (error) {
      res.failureResponse(error);
    }

  },
  async sendQuestion(req, res) {
    try {
      const data = req.body
      console.log("Sending question from the customer");
      const request = axios.post(
        "https://hook.eu1.make.com/bowaein3ewayp6dja71l18arj70ygks9",
        {
          companyName: get(data, "companyName", ""),
          email_address: get(data, "email_address", ""),
          description: get(data, "description", ""),
        }
      );
      res.ok()
    } catch (error) {
      res.failureResponse(error);
    }

  },
  async callTagWebhook(data){
    const request = axios.post(
      "https://hook.eu1.make.com/p781ubedhvl9xyseh4q8v8iffdav2n7o",
      {
        email: get(data, "email", ""),
        tag: get(data, "tag", ""),
      }
    );
  },

  async addTagToCustomer(req, res) {
    try {
      const data = req.body
      console.log("Adding tag to the customer");
      await callTagWebhook(data);
      res.created()
    } catch (error) {
      res.failureResponse(error);
    }

  },
};
module.exports = emailController;
