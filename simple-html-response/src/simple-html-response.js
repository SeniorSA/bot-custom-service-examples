const https = require('https');

const doPostRequest = () => {

  const data = {};

  return new Promise((resolve, reject) => {
    const options = {
      host: 'api.coindesk.com',
      path: '/v1/bpi/currentprice.json',
      method: 'GET',
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
    req.write(JSON.stringify(data));

    //finish the request
    req.end();
  });
};

module.exports = async (authorization, parameters) => {
  try
  {
    const coinData = await doPostRequest();
    let content = `<h1>${coinData.chartName}</h1><hr>`
    content += '<ul>'
    for (let index in coinData.bpi) {
      const bpi = coinData.bpi[index]
      content += `<li><abbr title="${bpi.description}">${bpi.code}</abbr>: <strong>${bpi.symbol}</strong> ${bpi.rate}</li>`
    }
    content += '</ul>'
    content += `<hr><small>${coinData.disclaimer}</small>`
    return {
        type: 'HTML',
        text: [content]
    }
  }
  catch(e){
      return {
          type: 'PLAINTEXT',
          text: [`Error: ${e.name} => ${e.message}`]
      }
  }
}   