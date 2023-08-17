const Axios = require('axios')
const Fs = require('fs')

const apiRequestNameCheap = require('./services/hosting/namecheap/apiZoneFile');

(async function main() {
  let abc = await apiRequestNameCheap.requestgetSerialApi('a','https://premium41.web-hosting.com:2083/cpsess4743515943/','vkinnfqj%3aIPXUT_OTxHlrtdAl%2c911b65d017933373b04b86553865dd5e')
  console.log(abc)
})();
