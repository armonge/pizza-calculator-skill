const Voxa = require('voxa');
const states = require('./states');
const _ = require('lodash');
const azure = require('botbuilder-azure');
const voxaOpearlo = require('voxa-opearlo');

const trimMultiline = string => _.map(string.split('\n'), _.trimStart).join('\n');
const views = {
  en: {
    translation: {
      Welcome: 'How many pizzas, of which size, do you want?',
      Pizza: [
        'Perfect! to make {number} {size} {pizza} you\'ll need {yeast} grams of yeast, {water} grams of water, {salt} grams of salt and {flour} grams of flour',
      ],
      TemplateTitle: '{number} {size} {pizza}',
      TemplateContent1: trimMultiline(`
          Perfect! To make {number} {size} {pizza} you'll need:
        `),
      TemplateContent2: trimMultiline(`
            {yeast} grams of yeast,

            {water} grams of water,

            {salt} grams of salt and

            {flour} grams of flour
        `),
      Hint: '*Try "Alexa, i want one large pizza"*',
      AlexaCard: {
        type: 'Simple',
        title: 'Example of the Card Title',
        content: 'Example of card content. This card has just plain text content.\nThe content is formatted with line breaks to improve readability.',
      },
    },
  },
};

const variables = {
  pizza: request => (request.model.pizzaValues.number !== 1 ? 'pizzas' : 'pizza'),
  number: request => request.model.pizzaValues.number,
  size: request => request.model.pizzaValues.size,
  yeast: request => request.model.pizzaValues.yeast,
  water: request => request.model.pizzaValues.water,
  salt: request => request.model.pizzaValues.salt,
  flour: request => request.model.pizzaValues.flour,
};

const app = new Voxa.VoxaApp({ views, variables });
voxaOpearlo(app, {
  userId: 'userId',
  appName: 'appName',
  apiKey: 'apiKey',
  suppressSending: false, // A flag to supress sending hits. Useful while developing on the skill
});

states.register(app);


const alexaSkill = new Voxa.AlexaPlatform(app);
exports.alexa = alexaSkill.lambda();

const dialogFlowAction = new Voxa.DialogFlowPlatform(app);
exports.dialogFlow = dialogFlowAction.lambda();

const storageName = '*******************';
const tableName = '*******';
const storageKey = '****************************************************************************************'; // Obtain from Azure Portal
const azureTableClient = new azure.AzureTableClient(tableName, storageName, storageKey);
const tableStorage = new azure.AzureBotStorage({ gzipData: false }, azureTableClient);

const cortana = new Voxa.BotFrameworkPlatform(app, {
  storage: tableStorage,
  recognizerURI: '**********************************************************************************************************************************************************************************************',
  applicationId: '************************************',
  applicationPassword: '***********************',
});


exports.cortana = cortana.lambda();
