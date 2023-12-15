const { get } = require("lodash");
const OpenAI = require("../OpenAI");
const { remove_linebreaks } = require("../../../utils/common");
const mongoose = require("mongoose");
const { getUserCollection, getBotCollection, getMessageCollection } = require("../../../utils/tenancy/Tenancy");
const { replayHandler } = require("./replayHandler")
const ReplayHandler = new replayHandler



class MsgConstructor {
  constructor(message, tenantId, botToken, botId) {
    this.callbackData = message;
    this.message = this.createMsjObject(message, tenantId, botToken);
    this.botId = botId;
    this.response = null;
    this.botToken = botToken;
    this.keywords = [];
    this.ai = false
  }

  createMsjObject(message, tenantId, botToken) {
    return {
      tenantId: tenantId,
      botToken: botToken,
      query: get(message, "message.text", ""),
      chat: get(message, "message.from", "null"),
      date: get(message, "message.date", 0),
      chatIdBot: get(message, "callback_query.message.chat.id", ""),
      queryData: get(message, "callback_query.data", ""),
      botCommand: get(message, "message.entities[0].type", ""),
      buttonReplay: get(
        message,
        "callback_query.message.reply_markup.inline_keyboard[0]",
        ""
      ),
    };
  }

  /**
   * STEP 1
   * Check if query is a message, if it's a button click - reply immidiately with button config
   */
  async processQuery() {
    try {
      const BotsCollection = await getBotCollection()
      const getbot = await BotsCollection.findById(new mongoose.Types.ObjectId(this.botId));
      this.message.botName = getbot.name

      ReplayHandler.botInstance(this.botToken)
      const chatId = this.message.chat.id || this.message.chatIdBot;
      const query = this.message.query.toLowerCase().replace(/\//g, "");

      if (
        this.message.botCommand === "bot_command" || this.message.buttonReplay) {
        /**
         * Process button click reply here
         */
        const MenuButtons = getbot.buttons;
        let MenuCommands = [];
        for (const menu of MenuButtons) {
          const userCommandMsg = this.message.query.replace(/\//g, "");
          if (userCommandMsg.includes(menu.name)) {
            MenuCommands.push(menu);
          }
        }

        /**
         * send text replay menu buttons
         */

        const matchingTextKeyword = MenuCommands.find(
          (buttons) => buttons.name === query
        );

        if (matchingTextKeyword?.config.isText) {
          const textMsg = matchingTextKeyword.config.textMsg;
          ReplayHandler.replyWithTextMsg(textMsg, chatId);
        }

        /**
         * send button reply meny buttons
         */

        const matchingButton = MenuCommands.find(
          (buttons) => buttons.name.replace(/\s/g, "") === query
        );

        if (matchingButton && matchingButton.config.isButtons) {
          ReplayHandler.replyWithMessageAndButtons(MenuCommands, chatId);

          // increment button count
          this.increaseButtonCount(MenuCommands[0]._id)
        }

        /**
         * send gallery reply menubuttons
         */
        const matchingGalleryKeyword = MenuCommands.find(
          (buttons) => buttons.name.replace(/\s/g, "") === query
        );
        if (matchingGalleryKeyword && matchingButton.config.isGallery) {
          let galleryConfig;
          for (const gallery of MenuCommands) {
            galleryConfig = gallery.config.gallery;
          }
          ReplayHandler.replyWithGallery(galleryConfig, chatId);
        }

        /**
         * send replay after button click
         */
        if (this.message.buttonReplay.length > 0) {
          const matchingCallbackData = this.message.buttonReplay.find(
            (callbackData) =>
              callbackData.callback_data === this.message.queryData
          );
          ReplayHandler.replyToButtonClick(matchingCallbackData.callback_data, chatId);
        }

        // save user inforamtion to our database if does not exist


      } else {
        this.storeUserIfnotExists()
        //Since this is not a button click, process this as usual with Step2, and Step3
        this.parseConfigPairsAndReply(getbot);
      }
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * STEP 2
   * First - if user has at least 1 label, classify if message belong to one of the labels that user has created.
   * Second - Go through the pairs keywords as you do today,
   * and look for matching keywords. If you find first matching keyword,
   * reply. You should only reply to the first matching keyword
   * Third - If none of the keywords been found in second step,
   * look for pairs that have label in query. Compare that selected label is what was classified in first step.
   * Only do this step if there is at least 1 label created by the customer
   */
  async parseConfigPairsAndReply(getbot, bot) {
    try {
      let keywordMatched = false;
      let labelMatched = false;
      // if its a label and ai node
      let isLabelNode = true
      if (await getbot.flow[0]?.pairs) {
        const pairs = await getbot.flow[0].pairs;
        const labels = await getbot.flow[0].pairs;
        const userMessage = this.message.query.toLowerCase().replace(/\//g, "");
        const chatId = this.message.chat.id || this.message.chatIdBot;

        /**
         * Filter pairs to those that have keywords in a query selected
         * Go through each filtered query and search those keywords in user message
         * If found a match, reply with the reply config
         * filter pairs for those that have query.ative === "keywords"
         * */

        /**
        * returns only pairs with reply properties
        */

        const queriesWithKeywords = pairs.filter(
          (item) => item.query?.active === "keywords" && !item.aiNode
        );

        for (const pair of queriesWithKeywords) {
          if (pair.query.active === "keywords" && !pair.aiNode) {
            const keywords = pair.query.keywords.concat(" ");

            for (const keyword of keywords) {
              const keywordValue = keyword.value?.toLowerCase();
              //TODO: validate if case insensitive
              if (userMessage.includes(keywordValue) || this.message.queryData) {
                keywordMatched = true;
                isLabelNode = false
                this.reply(pair.reply, chatId, bot);

                break;
              }
            }
          }
        }
        /**
         * returns only pairs with aiNode properties
         */
        const aiNodeQueries = pairs.filter(
          (item) => item.aiNode
        );
        for (const pair of aiNodeQueries) {
          if (pair.query.active === "keywords") {
            const keywords = pair.query.keywords.concat(" ");
            for (const keyword of keywords) {
              const keywordValue = keyword.value?.toLowerCase();
              //TODO: validate if case insensitive

              if (userMessage.includes(keywordValue) || this.message.queryData) {
                keywordMatched = true;
                isLabelNode = false
                this.reply(pair.aiNode, chatId, bot);
                break;
              }
            }
          }
        }


        // do this step if user created at least 1 label during bot creation
        if (labels.length > 0 && isLabelNode) {
          const queriesWithLabel = await labels.filter(
            (item) => item.query?.active === "labels"
          );

          //  returns an array of all labels user has
          if (queriesWithLabel) {
            const label = await queriesWithLabel.map((label) => {
              return label.query?.label;
            });

            // check if one of the labels is matched to the response of ai
            const response = await this.classifyMsg(label, userMessage);
            console.log("@ CLASSIFIED LABEL BY AI !! @", response)
            this.label = response
            if (response === "unknown") {
              labelMatched = false
            }
            const queryLabel = labels.filter(
              (item) => {
                const keyword = item.query.keywords.find(keyword => keyword.value.toLowerCase() === userMessage)
                return keyword
              }
            );
            const aiLabel = labels.filter(
              (item) =>
                item.query?.label?.toLowerCase() === response?.toLowerCase()
            );

            /**
             *  query label is when query is a label and replay is a query
             *  ai Label is when query is a label and replay is a ai node
             */
            let labelReplayConfig
            if (queryLabel.length > 0) {
              labelReplayConfig = queryLabel
            }
            if (aiLabel.length > 0) {
              labelReplayConfig = aiLabel
            }
            if (labelReplayConfig?.length > 0) {
              labelMatched = true
              const { reply, aiNode } = labelReplayConfig[0]
              if (reply?.isText) {
                this.storeMessageIfNotAI();
                ReplayHandler.replyWithTextMsg(reply.textMsg, chatId, bot);
              } else if (reply?.isButtons) {
                this.storeMessageIfNotAI();
                ReplayHandler.replyWithMessageAndButtons(reply.buttonConfig || reply.buttons, chatId, bot);
              } else if (reply?.isGallery) {
                this.storeMessageIfNotAI();
                ReplayHandler.replyWithGallery(reply.galleryConfig, chatId, bot);
              } else if (aiNode) {
                /**
                 * if its a label and ai node 
                 */
                const { yourNameIs, actAs, instructions } = aiNode
                const { tenantId, query, chat, botToken, date } = this.message
                await ReplayHandler.replyWithConfigAI(tenantId, query, chat, botToken, this.botId, date, yourNameIs, actAs, instructions)
              }
            }
          }
        }
      }

      //If neither keywordMatched or labelMatched, let AI reply on user query
      // !this.message.buttonReplay this data is when user clicks on button on telegram
      // so this response will not be send to kafka
      if (!keywordMatched && !labelMatched && !this.message.buttonReplay) {
        this.ai = true
        const { tenantId, query, chat, botToken, date } = this.message
        ReplayHandler.replyWithAI(tenantId, query, chat, botToken, this.botId, date)

      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * STEP 3
   * Reply to user based on the reply config: with text, buttons, or gallery
   * Skip the question reply, as we are going to disable that option for now
   * @param {*} replyConfig
   */
  async reply(replyConfig, chatId, bot) {
    try {
      if (replyConfig?.isText && !this.message.buttonReplay) {
        this.storeMessageIfNotAI();
        ReplayHandler.replyWithTextMsg(replyConfig.textMsg, chatId, bot);
      } else if (replyConfig?.isButtons && !this.message.buttonReplay) {
        this.storeMessageIfNotAI();
        ReplayHandler.replyWithMessageAndButtons(replyConfig.buttons, chatId, bot);
      } else if (replyConfig?.isGallery && !this.message.buttonReplay) {
        this.storeMessageIfNotAI();
        ReplayHandler.replyWithGallery(replyConfig.gallery, chatId, bot);
      } else if (replyConfig.yourNameIs) {

        /**
         * if its a keyword query and ai node 
         */
        console.log("@@@ PAIR AI NODE SENT TO KAFKA @@@")
        const { tenantId, query, chat, botToken, date } = this.message
        ReplayHandler.replyWithConfigAI(tenantId, query, chat, botToken, this.botId, date, replyConfig, replyConfig.actAs, replyConfig.instructions)
        this.ai === false

      }
      /**
       * store msg if not ai replay
       */



    } catch (error) {
      console.log(error);
    }
  }



  /**
   * Check if the user who sent a message to bot is a new user
   */
  async storeUserIfnotExists() {
    try {
      const users = await getUserCollection(this.message.tenantId)
      const searchCriteria = {
        userId: this.message.chat.id || this.message.chatIdBot,
        tenantId: this.message.tenantId,
      };
      const existingUser = await users.find(searchCriteria);
      /**
       * Save infomration about the user if one doesn't exist in our DB
       */
      if (Array.isArray(existingUser) && existingUser.length === 0) {
        console.log("@@@@user saved")
        const users = await getUserCollection(this.message.tenantId);
        const storeUsers = new users({
          tenantId: this.message.tenantId,
          userId: this.message.chat.id,
          username: this.message.chat.username,
          userFirstname: this.message.chat.first_name,
          userLastname: this.message.chat.last_name,
          isBot: this.message.chat.is_bot,
          botId: this.botId,
          botName: this.message.botName,
          botToken: this.message.botToken,
          labels: this.label,
        });
        await storeUsers.save()
      }
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * count the number of times button is clicked 
   */
  async increaseButtonCount(buttonId) {
    try {
      const BotsCollection = await getBotCollection()
      const getbot = await BotsCollection.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(this.botId),
          'buttons._id': new mongoose.Types.ObjectId(buttonId)
        },
        { $inc: { 'buttons.$.count': 1 } },
      );
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * Store message only if it is not being processed by AI
   */
  async storeMessageIfNotAI() {
    try {
      const Messages = await getMessageCollection(this.message.tenantId);
      if (this.message.query) {
        const storeMessages = new Messages({
          tenantId: get(this.message, "tenantId", ""),
          botToken: get(this.message, "botToken", ""),
          botId: get(this, "botId", ""),
          query: get(this.message, "query", ""),
          chatId: get(this.message, "chat.id", ""),
          contactFirstName: get(this.message, "chat.first_name", ""),
          contactLastName: get(this.message, "chat.last_name", ""),
          contactUsername: get(this.message, "chat.username", ""),
          date: get(this.message, "date", ""),
          label: this.label,
        });
        await storeMessages.save();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async classifyMsg(labels, query) {
    const openai = OpenAI.getOpenAI();
    try {
      /**
       * added few words in promt, when ai does not tell you which category is label , he will return unknown
       */
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `The following is a list of categories:\n ${labels} \n\nTell me which category you\'ll classify my question: " ${query}\n if none would fit the requirements then say unknown and that's it"`,
        temperature: 0,
        max_tokens: 6,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      const label = get(response, "data.choices[0].text", "unknown");
      return remove_linebreaks(label.replace(/\.$/, ""));
    } catch (error) {
      return "unknown";
    }
  }
}

module.exports = MsgConstructor;