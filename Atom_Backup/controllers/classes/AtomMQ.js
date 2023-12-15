const path = require("path");
require("dotenv").config();
const amqp = require('amqplib/callback_api');

class MQFactory {

  constructor() {
    console.log("@@@@@@@@ initializing MQ @@@@@@@@@@@")
    try {
      const opt = { credentials: require('amqplib').credentials.plain(process.env.MQ_USERNAME, process.env.MQ_PASWD) };
      amqp.connect(process.env.MQ_HOST, opt, (error0, connection) => {
        if (error0) {
          throw error0;
        }
        connection.createChannel((error1, channel) => {
          if (error1) {
            console.log("Couldn't create a channel ", error1);
            throw error1;
          }
          this.channel = channel;
          channel.assertQueue("train_on_urls", {
            durable: false
          });
          channel.assertQueue("train_on_file", {
            durable: false
          });
          channel.assertQueue("train_on_input", {
            durable: false
          });
          channel.assertQueue("train_on_confluence", {
            durable: false
          });
        });
      });
    } catch (error) {
      console.log("Error connecting");
    }
  }

  async sendURLTask(task, tenantId) {
    task.tenantId = tenantId;
    this.channel.sendToQueue("train_on_urls", Buffer.from(JSON.stringify(task)));
  }
  async sendFileTask(task, tenantId) {
    task.tenantId = tenantId;
    this.channel.sendToQueue("train_on_file", Buffer.from(JSON.stringify(task)));
  }
  async sendInputTask(task, tenantId) {
    task.tenantId = tenantId;
    this.channel.sendToQueue("train_on_input", Buffer.from(JSON.stringify(task)));
  }
  async sendConfluenceTask(task, tenantId) {
    task.tenantId = tenantId;
    this.channel.sendToQueue("train_on_confluence", Buffer.from(JSON.stringify(task)));
  }
  async sendGithubTask(task, tenantId) {
    task.tenantId = tenantId;
    this.channel.sendToQueue("train_on_github", Buffer.from(JSON.stringify(task)));
  }
}
module.exports = new MQFactory();