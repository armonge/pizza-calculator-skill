const Voxa = require('voxa');
const _ = require('lodash');
const { Responses } = require('actions-on-google');

function getPizzaVolumes(number, size, waterContent) {
  const parsedNumber = parseInt(number, 10);
  const sizeToGrams = {
    small: 200,
    medium: 250,
    large: 300,
  };

  let parsedWaterContent;

  if (!parsedWaterContent) {
    parsedWaterContent = 57;
  } else {
    parsedWaterContent = parseInt(waterContent, 10);
  }

  // B7 = pizzaNumber
  // B8 = pizzaSizeInGrams
  // B9 = waterContent
  const B7 = parsedNumber;
  const B8 = sizeToGrams[size];
  const B9 = parsedWaterContent;

  const flour = _.round((B7 * B8) / (1 + (B9 / 100) + 0.03 + 0.002), 1);
  const water = _.round((flour * B9) / 100, 1);
  const salt = _.round(0.03 * flour, 1);
  const yeast = _.round(0.002 * flour, 1);

  return {
    flour, water, salt, yeast, number: parsedNumber, size,
  };
}

exports.register = function register(app) {
  app.onRequestStarted((request) => {
    console.log(JSON.stringify({
      intent: request.intent.name,
      params: request.intent.params,
    }, null, 2));
  });
  app.onIntent('LaunchIntent', {
    to: 'entry',
    ask: 'Welcome',
    alexaHint: 'Hint',
  });

  app.onIntent('HelpIntent', {
    ask: 'Help',
    to: 'entry',
  });

  app.onUnhandledState(_.constant({ ask: 'Help', to: 'entry' }));

  app.onIntent('PizzaIntent', async (request) => {
    const { params } = request.intent;
    if (request.platform === 'cortana') {
      if (params['builtin.number'] && params.size) {
        request.model.pizzaValues = getPizzaVolumes(params['builtin.number'], params.size, params['builtin.percentage']);
        return { tell: 'Pizza' };
      }

      return { ask: 'Welcome', to: 'entry' };
    }

    if (!request.intent.params.number || !request.intent.params.size) {
      return {
        to: 'entry',
        alexaDialogDelegate: undefined,
        Hint: 'Hint',
      };
    }

    request.model.pizzaValues = getPizzaVolumes(params.number, params.size, params.waterContent);

    console.log(Voxa.alexa);

    const alexaTemplate = new Voxa.alexa.DisplayTemplate('BodyTemplate1')
      .setTitle(await request.renderer.renderPath('TemplateTitle', request))
      .setTextContent(await request.renderer.renderPath('TemplateContent1', request), await request.renderer.renderPath('TemplateContent2', request))
      .setBackgroundImage('http://www.vincenzosplate.com/wp-content/uploads/2017/02/neapolitan-pizza.jpg', 'Pizza')
      .setToken('pizza');


    const dialogFlowCard = new Responses.BasicCard()
      .setTitle(await request.renderer.renderPath('TemplateTitle', request))
      .setBodyText(await request.renderer.renderPath('TemplateContent2', request))
      .setImage('http://www.vincenzosplate.com/wp-content/uploads/2017/02/neapolitan-pizza.jpg', 'Pizza')
      .setImageDisplay('CROPPED');

    return {
      tell: 'Pizza', alexaRenderTemplate: alexaTemplate, dialogFlowCard, alexaCard: 'AlexaCard',
    };
  });
};
