// const { getAllButtonsInBot, createButton } = require("../button-controller");
// const Bot = require("../../models/Bot");

// jest.mock("../../models/Bot", () => ({
//   findById: jest.fn(),
// }));

// describe("getAllButtonsInBot", () => {
//   test("should return empty data and error message when bot is not found", async () => {
//     Bot.findById.mockResolvedValue(null);

//     const botId = "BotId";
//     const result = await getAllButtonsInBot(botId);

//     expect(result).toEqual({
//       data: [],
//       message: "there's no bot ",
//     });
//   });

//   test("should return bot buttons data and success message when bot is found", async () => {
//     const Bots = {
//       _id: "someBotId",
//       buttons: [
//         {
//           name: "ddddd",
//           config: {
//             isText: false,
//             isButtons: false,
//             isGallery: false,
//             isQuestions: false,
//             textMsg: "",
//             buttons: {
//               buttonsMsg: "",
//               actionButtons: [
//                 {
//                   name: "Назва кнопки",
//                   action: "",
//                   value: "Give me a Name",
//                 },
//               ],
//             },
//             gallery: [
//               {
//                 title: "",
//                 description: "",
//                 buttonName: "Детальніше",
//                 buttonURL: "",
//               },
//             ],
//             questions: [
//               {
//                 query: "",
//                 variable: "",
//                 inputTypes: {
//                   text: true,
//                   email: false,
//                   phone: false,
//                 },
//               },
//             ],
//           },
//           createdAt: {
//             $date: "2023-07-30T12:51:21.739Z",
//           },
//           updatedAt: {
//             $date: "2023-07-30T12:51:21.739Z",
//           },
//         },
//       ],
//     };
//     Bot.findById.mockResolvedValue(Bots);

//     const botId = "someExistingBotId";
//     const result = await getAllButtonsInBot(botId);

//     expect(result).toEqual({
//       data: Bots.buttons,
//       message: "Buttons for the bot retrieved successfully",
//     });
//   });
// });
