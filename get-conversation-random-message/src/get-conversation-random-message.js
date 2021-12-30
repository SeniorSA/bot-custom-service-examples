// Packages
const https = require('https');
// Platform URL
const HOST_PLATFORM = 'platform-homologx.senior.com.br';
const PATH_GET_CONVERSATION_HISTORY = '/t/senior.com.br/bridge/1.0/rest/platform/botfactory/queries/getConversationHistory';

const doRequest = (host, path, method, authorization, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      host: host,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization
      }
    };
    
    //create the request object with the callback with the result
    const req = https.request(options, (res) => {
      let msg = '';
      res.on('data', (chunk) => msg += chunk);
      res.on('end', () => resolve(JSON.parse(msg)));
    });

    // handle the possible errors
    req.on('error', (e) => {
      reject(e.message);
    });
    
    //do the request
    req.write(JSON.stringify(body));

    //finish the request
    req.end();
  });    
}

const getConversationHistory = (authorization, conversationId) => {
  const body = {conversationId: conversationId};
  return doRequest(HOST_PLATFORM, PATH_GET_CONVERSATION_HISTORY, 'POST', authorization, body)
};

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const findRandomUserMessage = (messages) => {
  const min = 0
  const max = messages.length - 1
  while (true) {
    const i = getRandomInt(min, max)
    const message = messages[i]
    if (message.sourceType == 'USER') {
      return message
    }
  }
}

module.exports = async (authorization, parameters) => {
  let content = `Hello, this conversationId is <strong>${parameters.default.conversationId}!</strong><hr>`;
  try
  {
    const conversationHistory = await getConversationHistory(authorization, parameters.default.conversationId);
    if (conversationHistory.reason) {
        content += `${conversationHistory.reason} => ${conversationHistory.message}`
    } else {
      const lastUserMessage = findRandomUserMessage(conversationHistory.messages);
      content += `Here are a random user message is:<br><p align=center><small>${lastUserMessage.contents[0].text}</small></p>`
    }
  }
  catch(e){
    content += `Executing this node get an error:<br><p align=center><small>${parameters.default.conversationId}: ${e.name} => ${e.message}</small></p>`
  }
  finally {
    content += `<hr>Here are the received parameters:<br><p align=center><small>${JSON.stringify(parameters)}</small></p>`
    return {
      type: 'HTML',
      text: [content]
    }
  }
}