const Fs = require('fs')

const nameCheapHostingProcess = require('./services/hosting/namecheap/namecheap')
const hostgatorHostingProcess = require('./services/hosting/hostgator/hostgator')
const { convertZoneFiletoArray } = require('./services/processZoneFileData/formatData');

// read Config
// read ZoneFile 


// convertZoneFiletoArray(zoneFileData)
// Login to Cpanel

(async function main() {

  const configData = await Fs.readFileSync(`./cpanel.txt`,'utf8').trim();
  const args = configData.split('|')
  let config = {}
  if (args[0]) {
    config.domain = args[0]
  } else {
    console.log('not see DOMAIN parameter')
  }

  if (args[1]) {
    config.username = args[1]
  } else {
    console.log('not see Username parameter')
  }

  if (args[2]) {
    config.password = args[2]
  } else {
    console.log('not see Password parameter')
  }

  if (args[3]) {
    config.hostingService = args[3]
  } else {
    console.log('not see HostingService parameter')
  }

  if (args[4]) {
    config.zoneFile = args[4]
  } else {
    console.log('not see ZoneFile parameter')
  }

  console.log(config)

  // check zonefile exist
  if (Fs.existsSync(config.zoneFile)) {
    config.zoneFile = args[4]
  } else {
    console.log(" Error zonefile not found !!")
    return
  }

  let DNSZoneData = await convertZoneFiletoArray(config.zoneFile)
  if (DNSZoneData.error){
    console.log( `error : ${DNSZoneData.error}` )
    return
  }

  if (config.hostingService == 'namecheap') {
    await nameCheapHostingProcess(DNSZoneData, config)
  }
  if (config.hostingService == 'hostgator') {
    await hostgatorHostingProcess(DNSZoneData, config)
  }

})();

// Post request 

// Log result

