'use strict';

const Voxa = require('voxa');
const states = require('./states');
const _ = require('lodash');
const azure = require('botbuilder-azure');

const trimMultiline = (string) => _.map(string.split('\n'), _.trimStart).join('\n')
const views = {
    en: {
      translation: {
        Welcome: 'How many pizzas, of which size, do you want?',
        Pizza: [
          'Perfect! to make {number} {size} {pizza} you\'ll need {yeast} grams of yeast, {water} grams of water, {salt} grams of salt and {flour} grams of flour'
        ],
        TemplateTitle: "{number} {size} {pizza}",
        TemplateContent1: trimMultiline(`
          Perfect! To make {number} {size} {pizza} you\'ll need:
        `),
        TemplateContent2: trimMultiline(`
            {yeast} grams of yeast,

            {water} grams of water,

            {salt} grams of salt and

            {flour} grams of flour
        `),
        Hint: '*Try "Alexa, i want one large pizza"*',
        AlexaCard: {
          "type": "Simple",
          "title": "Example of the Card Title",
          "content": "Example of card content. This card has just plain text content.\nThe content is formatted with line breaks to improve readability."
        }
      },
    }
};

const variables = {
  pizza: request => request.model.pizzaValues.number !== 1 ? 'pizzas' : 'pizza',
  number: request => request.model.pizzaValues.number,
  size: request => request.model.pizzaValues.size,
  yeast: request => request.model.pizzaValues.yeast,
  water: request => request.model.pizzaValues.water,
  salt: request => request.model.pizzaValues.salt,
  flour: request => request.model.pizzaValues.flour,
};

exports.alexa = (event, context, callback) => {
  const app = new Voxa({ views, variables });
  states.register(app);
  const alexaSkill = new Voxa.Alexa(app);
  alexaSkill.lambda()(event, context, callback);
};

exports.dialogFlow = (event, context, callback) => {
  const app = new Voxa({ views, variables });
  states.register(app);
  const dialogFlowAction = new Voxa.DialogFlow(app);
  dialogFlowAction.lambda()(event, context, callback)
};

exports.cortana = (event, context, callback) => {
  const app = new Voxa({ views, variables });
  states.register(app);

  const storageName = 'pizzacalculator'; // Obtain from Azure Portal
  const tableName = 'botdata';
  const storageKey = '****************************************************************************************'; // Obtain from Azure Portal
  const azureTableClient = new azure.AzureTableClient(tableName, storageName, storageKey);
  const tableStorage = new azure.AzureBotStorage({ gzipData: false }, azureTableClient);

  const cortana = new Voxa.Cortana(app, {
    storage: tableStorage,
    recognizerURI: '**********************************************************************************************************************************************************************************************',
    applicationId: '************************************',
    applicationPassword: '***********************'
  });
  cortana.lambda()(event, context, callback);
};
