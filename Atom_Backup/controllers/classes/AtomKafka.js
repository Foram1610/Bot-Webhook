const path = require("path");
require("dotenv").config();
const { Kafka, CompressionTypes, logLevel } = require('kafkajs')
// const MyPartitioner = () => {
//   return ({ topic, partitionMetadata, message }) => {
//       // select a partition based on some logic
//       // return the partition number
//       console.log("Partitions data");
//       console.log("topic ", topic);
//       console.log("partitionMetadata ", partitionMetadata);
//       console.log("message ", message);
//       return 2
//   }
// }

class ProducerFactory {

  constructor() {
    this.producer = this.createProducer()
    this.start();
  }

  async start() {
    try {
      console.log("@@@@@ Trying to connect to producer");
      await this.producer.connect()
      console.log("@@@@@ Connected producer");
    } catch (error) {
      console.log('Error connecting the producer: ', error)
    }
  }

  async shutdown() {
    await this.producer.disconnect()
  }

  async sendBatch(messages) {

    const kafkaMessages = messages.map((message) => {
      return {
        value: JSON.stringify(message)
      }
    })

    const topicMessages = {
      topic: 'query_user_normal',
      messages: kafkaMessages
    }
    const batch = {
      topicMessages: [topicMessages]
    }

    await this.producer.sendBatch(batch)
  }

  async sendBatchWebhook(messages) {

    const kafkaMessages = messages.map((message) => {
      return {
        value: JSON.stringify(message)
      }
    })

    const topicMessages = {
      topic: 'query_priority_queue',
      messages: kafkaMessages
    }
    const batch = {
      topicMessages: [topicMessages]
    }

    await this.producer.sendBatch(batch)
  }
  createProducer() {
    let kafka = null;
    try {
      kafka = new Kafka({
        clientId: 'atom-server',
        logLevel: logLevel.INFO,
        brokers: process.env.KAFKA_URL.split(','),
        retry: {
          initialRetryTime: 100,
          retries: 8
        }
      })
    } catch (error) {
      console.log("Failed to connect to Kafka", error);
    }


    return kafka ? kafka.producer() : null;
  }
}
module.exports = new ProducerFactory();
