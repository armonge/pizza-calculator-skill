const Voxa = require('voxa');
const _ = require('lodash');
const { Responses } = require('actions-on-google');


exports.register =  function register(app) {
  app.onIntent('LaunchIntent', {
    to: 'entry',
    ask: 'Welcome',
    Hint: 'Hint'
  });

  app.onIntent('HelpIntent', {
    ask: 'Help',
    to: 'entry',
  });

  app.onUnhandledState((request) => {
    console.log(request);
    return { ask: 'Help', to: 'entry' };
  })

  app.onIntent('PizzaIntent', async (request, reply) => {
    const params = request.intent.params;
    if (request.platform === 'cortana') {
      console.log(request.intent.params, request.intent.name)
      if (params['builtin.number'] && params['size']) {
        request.model.pizzaValues = getPizzaVolumes(params['builtin.number'], params.size, params['builtin.percentage']);
        return { tell: 'Pizza' };
      }

      return { ask: 'Welcome', to: 'entry' };

    }

    if (!request.intent.params.number || !request.intent.params.size) {
      return { to: 'entry',  DialogDelegate: undefined, Hint: 'Hint' };
    }

    request.model.pizzaValues = getPizzaVolumes(params.number, params.size, params.waterContent);

    const alexaTemplate = new Voxa.Alexa.DisplayTemplate('BodyTemplate1')
      .setTitle(await reply.render('TemplateTitle'))
      .setTextContent(await reply.render('TemplateContent1'), await reply.render('TemplateContent2'))
      .setBackgroundImage('http://www.vincenzosplate.com/wp-content/uploads/2017/02/neapolitan-pizza.jpg', 'Pizza')
      .setToken('pizza')


    const dialogFlowCard = new Responses.BasicCard()
      .setTitle(await reply.render('TemplateTitle'))
      .setBodyText(await reply.render('TemplateContent2'))
      .setImage('http://www.vincenzosplate.com/wp-content/uploads/2017/02/neapolitan-pizza.jpg', 'Pizza')
      .setImageDisplay('CROPPED')

    return { tell: 'Pizza', RenderTemplate: alexaTemplate, BasicCard: dialogFlowCard, HomeCard: 'AlexaCard' };
  });
}

function getPizzaVolumes(number, size, waterContent) {
  number = parseInt(number, 10);
  const sizeToGrams = {
    small: 200,
    medium: 250,
    large: 300,
  };

  if (!waterContent) {
    waterContent = 57;
  } else {
    waterContent = parseInt(waterContent, 10);
  }

  // B7 = pizzaNumber
  // B8 = pizzaSizeInGrams
  // B9 = waterContent
  const B7 = number;
  const B8 = sizeToGrams[size];
  const B9 = waterContent;

  const flour = _.round((B7 * B8)/(1 + ( B9 / 100) + 0.03 + 0.002), 1);
  const water = _.round((flour * B9) / 100, 1);
  const salt = _.round(0.03 * flour, 1);
  const yeast = _.round(0.002 * flour, 1);

  return { flour, water, salt, yeast, number, size };
}
