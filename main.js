const Fs = require('fs')
const nameCheapHostingProcess = require('./services/hosting/namecheap/namecheap')
const hostgatorHostingProcess = require('./services/hosting/hostgator/hostgator')
const {convertZoneFiletoArray} = require('./services/processZoneFileData/formatData')

// read Config
const config = JSON.parse(Fs.readFileSync('./data/cpanel.json', 'utf-8'));
// read ZoneFile 


// convertZoneFiletoArray(zoneFileData)
// Login to Cpanel

(async function main() {

    let DNSZoneData = await convertZoneFiletoArray(config.zoneFile)

    if(config.hostingService == 'namecheap'){
      await nameCheapHostingProcess(DNSZoneData)
    }
    if(config.hostingService == 'hostgator'){
      await hostgatorHostingProcess(DNSZoneData)
    }

})();

// Post request 

// Log result

