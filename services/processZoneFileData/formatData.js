const Fs = require('fs')
// read Config

async function convertZoneFiletoArray(zoneFileName) {
  const zoneFileData = await Fs.readFileSync(`././${zoneFileName}`, 'utf-8');

  
  if(zoneFileData.indexOf('#start#') == -1){
    return {error: 'Not found #start# in zoneFile'}
  }

  if(zoneFileData.indexOf('#end#') == -1){
    return {error: 'Not found #end# in zoneFile'}
  }
  // get DNS information
  let result = (zoneFileData.split('#start#')[1]).split('#end#')[0]

  // replace \t
  result = result.replaceAll('\t', ' ')

  // remove \n rsa
  result = result.replace('k=rsa; "\n   "p', 'k=rsa;p')

  // remove DKIM key default
  result = result.replace('; ----- DKIM key default for de', '')

  result = result.trim()

  // split  DNS information to array
  result = result.split('\n')

  // remove empty information in DNS
  result = result.filter(element => {
    return element.length > 10
  })

  let dnsDataArr = []
  let checkSubDomain = false
  result.forEach(element => {
    dnsData = element.split(' ').filter(element => { return element.length != '' });
    let dnsType = ''
    if(dnsData[0][dnsData[0].length-1] =='.'){
      dnsData[0] = dnsData[0].slice(1,dnsData[0].length - 1)
    }
    // Label Type 
    if (dnsData[0].indexOf('_domainkey') != -1) {
      if (dnsData[0].indexOf('root._domainkey') != -1) {
        dnsType = 'root_domainkey'
      } else {
        dnsType = 'domainkey'
      }
    }

    if (dnsData[0].indexOf('dmarc') != -1) {
        dnsType = 'dmarc'
    }
    if (dnsData[0].indexOf('www') != -1) {
      checkSubDomain = true
    }

    if (checkSubDomain == true && dnsData.length == 4 && dnsData[2] == 'A') {
      dnsType = 'subdomain'
    }else{
      checkSubDomain = false
    }

    if(dnsData[4] && dnsData[4].indexOf('=spf') != -1){
      dnsType = 'spf'
    }

    if (element.indexOf('"') != -1) {
      let valueFinal = element.split('"')[1]
      dnsDataArr.push({ dnsData: [dnsData[0], dnsData[1], dnsData[2], valueFinal], type: dnsType })
    } else {
      dnsDataArr.push({ dnsData: dnsData, type: dnsType })
    }


  })

  return dnsDataArr
}




module.exports = {
  convertZoneFiletoArray
}

// Post request 

// Log result

