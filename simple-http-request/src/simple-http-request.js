const https = require('https');

const doPostRequest = (ano) => {

  const data = {};

  return new Promise((resolve, reject) => {
    const options = {
      host: 'brasilapi.com.br',
      path: `/api/feriados/v1/${ano}`,
      method: 'GET',
    };
    
    //create the request object with the callback with the result
    const req = https.request(options, (res) => {
      let msg = '';
      res.on('data', (chunk) => msg += chunk);
      res.on('end', () => resolve(msg));
      //resolve(res.statusCode);
    });

    // handle the possible errors
    req.on('error', (e) => {
      reject(e.message);
    });
    
    //do the request
    req.write(JSON.stringify(data));

    //finish the request
    req.end();
  });
};


module.exports = async (authorization, parameters) => {
    try
    {
        const ano = 2022;
        var message = `Feriados de ${ano}`;
        var feriados = JSON.parse(await doPostRequest(ano));
        for (const index in feriados){
            const feriado = feriados[index];
            message += ` | ${feriado.date} => ${feriado.name}`;
        }
        return {
            type: 'PLAINTEXT',
            text: [message]
        }
    }
    catch(e){
        return {
            type: 'PLAINTEXT',
            text: [`Error: ${e.name} => ${e.message}`]
        }
    }
    
}