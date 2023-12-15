const ProducerFactory = require("../AtomKafka");
const AtomBot = require("../Telegram/Bot");

exports.replayHandler = class ReplayConstrutor {
    botInstance(botToken) {
        const BotHandler = new AtomBot(botToken);
        const botInstance = BotHandler.bot;
        this.BotHandler = botInstance
    }

    async replyWithTextMsg(replyText, chatId) {
        /**
         * If reply is a text message
         */
        await this.BotHandler.telegram.sendMessage(chatId, replyText);
    }

    async replyWithMessageAndButtons(buttonReplay, chatId) {

        /**
         * If reply config contains buttons
         */
        // ps: menu buttons config and pairs button config dont have
        // the same config thats why we have else statement
        this.inlineKeyboard = [];
        if (Array.isArray(buttonReplay)) {
            for (const buttonReplayItem of buttonReplay) {
                for (const button of buttonReplayItem.config.actionButtons) {
                    const inlineButton = {
                        text: button.name || "Give me a name",
                        callback_data: button.value || "data",
                    };
                    this.inlineKeyboard.push(inlineButton);
                }
            }
        } else {
            const { actionButtons } = buttonReplay;
            for (const buttonReplay of [actionButtons]) {
                for (const button of buttonReplay) {
                    const inlineButton = {
                        text: button.name || "Give me a name",
                        callback_data: button.value || "data",

                    };
                    this.inlineKeyboard.push(inlineButton);

                }
            }
        }
        // button msg in reply pair is in reply config
        // buttonMsg in menu commands is in the config property
        await this.BotHandler.telegram.sendMessage(chatId, buttonReplay.buttonsMsg || buttonReplay[0].config.buttonsMsg || "data", {
            reply_markup: {
                inline_keyboard: [this.inlineKeyboard],
            },
        });
    }
    async replyToButtonClick(replayText, chatId) {
        //this is getting data for repalying to user after he clicks on button

        await this.BotHandler.telegram.sendMessage(chatId, replayText);
    }

    async replyWithGallery(galleryReplay, chatId) {
        const Regex = /\s+/g

        /**
         * If reply config contains the gallery
         */

        for (const image of galleryReplay) {
            const inlineKeyboard = [
                {
                    text: image.buttonName.replace(Regex, ''),
                    url: image.buttonURL.replace(Regex, ''),
                    callback_data: "image" || "Data",
                },
            ];
            await this.BotHandler.telegram.sendPhoto(chatId, "https://i.ibb.co/bsG4DPM/OIP.jpg", {
                caption: image.description,
                reply_markup: {
                    inline_keyboard: [inlineKeyboard],
                },
            });
        }
    }

    async replyWithAI(tenantId, query, chat, botToken, botId, date) {
        /**
         * If reply config is an AI reply
         * Note: This query is sent to Kafka for Python to process and reply.
         */
        console.log("@@@ REPLAY WITH AI SEND BATCH TO KAFKA@@@");

        ProducerFactory.sendBatch([
            {
                tenantId: tenantId,
                user_msg: query,
                chat: chat,
                bot_token: botToken,
                bot_id: botId,
                integration: "telegram",
                date: date,
            },
        ]);
    }
    async replyWithConfigAI(tenantId, query, chat, botToken, botId, date, yourNameIs, actAs, instructions) {
        /**
         * If reply config is an AI reply
         * Note: This query is sent to Kafka for Python to process and reply.
         */

        ProducerFactory.sendBatch([
            {
                bot_token: botToken,
                tenantId: tenantId,
                chat: chat,
                bot_id: botId,
                integration: "telegram",
                date: date,
                yourNameIs: yourNameIs,
                actAs: actAs,
                instructions: instructions,
                user_msg: query,
            },
        ]);
    }



}