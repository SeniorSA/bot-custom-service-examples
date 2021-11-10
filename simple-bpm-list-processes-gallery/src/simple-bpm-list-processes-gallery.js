/*
  Docs: https://dev.senior.com.br/documentacao/menu-personalizado-com-processos-bpm/
*/

const https = require('https');

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
      //resolve(res.statusCode);
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

const getProcessList = (authorization) => {
  const body = {};
  return doRequest('platform-homologx.senior.com.br', '/t/senior.com.br/bridge/1.0/rest/platform/workflow/queries/getProcessesList?serviceAction=UserGrantedProcesses', 'GET', authorization, body)
};

module.exports = async (authorization, parameters) => {
    try
    {
        const output = await getProcessList(authorization);
        if (output.errorCode) {
          return {
              type: 'PLAINTEXT',
              text: [output.message]
          }
        }
        
        var cards = [];
        for (const index in output.processes) {
            const item = output.processes[index];
            cards.push({
                imageUrl: 'https://uploads-ssl.webflow.com/5d19bb502daf2fbde3383a21/5e2af13c47a6a24a8f608ac5_what-is-business-process.jpg',
                title: item.processName,
                description: item.description,
                option: {
                  text: 'Nova Solicitação',
                  url: `https://platform-homologx.senior.com.br/tecnologia/platform/cockpit-frontend/#/app/newrequest/new-process/${item.processId}`
                }
            })
        }
        return {
            type: 'GALLERY',
            cards: cards
        }
    }
    catch(e){
        return {
            type: 'PLAINTEXT',
            text: [`Error: ${e.name} => ${e.message}`]
        }
    }
}