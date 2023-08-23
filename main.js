const Fs = require('fs')
const nameCheapHostingProcess = require('./services/hosting/namecheap/namecheap')
const hostgatorHostingProcess = require('./services/hosting/hostgator/hostgator')
const { convertZoneFiletoArray } = require('./services/processZoneFileData/formatData');

// read Config
// read ZoneFile 


// convertZoneFiletoArray(zoneFileData)
// Login to Cpanel

(async function main() {


  let args = process.argv
  let config = {}
  if (args[2]) {
    config.domain = args[2]
  } else {
    console.log('not see DOMAIN parameter')
  }

  if (args[3]) {
    config.username = args[3]
  } else {
    console.log('not see Username parameter')
  }

  if (args[4]) {
    config.password = args[4]
  } else {
    console.log('not see Password parameter')
  }

  if (args[5]) {
    config.hostingService = args[5]
  } else {
    console.log('not see HostingService parameter')
  }

  if (args[6]) {
    config.zoneFile = args[6]
  } else {
    console.log('not see ZoneFile parameter')
  }

  console.log(config)

  let DNSZoneData = await convertZoneFiletoArray(config.zoneFile)


  if (config.hostingService == 'namecheap') {
    await nameCheapHostingProcess(DNSZoneData, config)
  }
  if (config.hostingService == 'hostgator') {
    await hostgatorHostingProcess(DNSZoneData, config)
  }

})();

// Post request 

// Log result

