require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

class OpenAI {
    constructor() {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.openAI = new OpenAIApi(configuration);
    }
    getOpenAI(){
        return this.openAI;
    }
  }

module.exports = new OpenAI();