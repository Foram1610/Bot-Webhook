// const { createButton } = require("../button-controller");
// const Bot = require("../../models/Bot");
// ////

// jest.mock("../../models/Bot", () => ({
//   findOneAndUpdate: jest.fn(),
// }));

// const sampleBotData = {
//   _id: "someBotId",
//   buttons: [
//     {
//       name: "ddddd",
//       config: {
//         isText: false,
//         isButtons: false,
//         isGallery: false,
//         isQuestions: false,
//         textMsg: "",
//         buttons: {
//           buttonsMsg: "",
//           actionButtons: [
//             {
//               name: "Назва кнопки",
//               action: "",
//               value: "Give me a Name",
//             },
//           ],
//         },
//         gallery: [
//           {
//             title: "",
//             description: "",
//             buttonName: "Детальніше",
//             buttonURL: "",
//           },
//         ],
//         questions: [
//           {
//             query: "",
//             variable: "",
//             inputTypes: {
//               text: true,
//               email: false,
//               phone: false,
//             },
//           },
//         ],
//       },
//       createdAt: {
//         $date: "2023-07-30T12:51:21.739Z",
//       },
//       updatedAt: {
//         $date: "2023-07-30T12:51:21.739Z",
//       },
//     },
//   ],
// };

// describe("createButton", () => {
//   test("should create a new button for an existing bot", async () => {
//     Bot.findOneAndUpdate.mockResolvedValue(sampleBotData);

//     const botId = "someBotId";
//     const buttonParams = {
//       name: "New Button",
//       config: {
//         isText: true,
//         isButtons: true,
//         isGallery: true,
//         isQuestions: true,
//         textMsg: "Hello, this is a text message.",
//         buttons: {
//           buttonsMsg: "Please choose an option:",
//           actionButtons: [
//             {
//               name: "Option 1",
//               action: "action_1",
//               value: "Option 1 Value",
//             },
//             {
//               name: "Option 2",
//               action: "action_2",
//               value: "Option 2 Value",
//             },
//           ],
//         },
//         gallery: [
//           {
//             title: "Gallery Item 1",
//             description: "Description for Gallery Item 1",
//             buttonName: "Button 1",
//             buttonURL: "https://example.com/button-1",
//           },
//           {
//             title: "Gallery Item 2",
//             description: "Description for Gallery Item 2",
//             buttonName: "Button 2",
//             buttonURL: "https://example.com/button-2",
//           },
//         ],
//         questions: [
//           {
//             query: "What's your name?",
//             variable: "user_name",
//             inputTypes: {
//               text: true,
//               email: true,
//               phone: true,
//             },
//           },
//         ],
//       },
//     };

//     const result = await createButton(buttonParams, botId);

//     expect(result).toEqual({
//       data: sampleBotData,
//       message: "Button created successfully",
//     });
//   });

//   test("should return empty data and error message when bot is not found", async () => {
//     Bot.findOneAndUpdate.mockResolvedValue(null);

//     const botId = "nonExistingBotId";
//     const buttonParams = {
//       name: "New Button",
//       config: {
//         // ... button config properties ...
//       },
//     };

//     const result = await createButton(buttonParams, botId);

//     expect(result).toEqual({
//       data: [],
//       message: "there's no bot ",
//     });
//   });
// });
