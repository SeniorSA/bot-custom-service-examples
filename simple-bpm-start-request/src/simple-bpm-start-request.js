// Packages
const https = require('https');
// Platform URL
const HOST_PLATFORM = 'platform-homologx.senior.com.br';
const PATH_GET_PROCESSES_LIST = '/t/senior.com.br/bridge/1.0/rest/platform/workflow/queries/getPublishedProcess';
const PATH_START_REQUEST = '/t/senior.com.br/bridge/1.0/rest/platform/workflow/actions/startRequest';
// Code
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

const getProcessList = (authorization) => {
  const body = {};
  return doRequest(HOST_PLATFORM, PATH_GET_PROCESSES_LIST, 'GET', authorization, body)
};

const startRequest = (authorization, processId, businessData) => {
  const body = {
    processId: processId,
    businessData: businessData
  };
  return doRequest(HOST_PLATFORM, PATH_START_REQUEST, 'POST', authorization, body)
};

const findProcess = (processName, processes) => {
  for (const index in processes) {
    const item = processes[index];
    if (item.processName.toLowerCase() == processName.toLowerCase()) {
      return item;
    }
  }
}

module.exports = async (authorization, parameters) => {
  try
  {
    const processList = await getProcessList(authorization);
    let process = findProcess(parameters.processName, processList.processes);
    if (!process) {
      return {
        type: 'PLAINTEXT',
        text: [`Processo ${parameters.processName} não encontrado.`]
      }
    }
    const output = await startRequest(authorization, process.processId, {});
    return {
      type: 'PLAINTEXT',
      text: [`Requisição criada com o id ${output.processInstanceID}`]
    }
  }
  catch(e){
    return {
      type: 'PLAINTEXT',
      text: [`Error: ${e.name} => ${e.message}`]
    }
  }
}