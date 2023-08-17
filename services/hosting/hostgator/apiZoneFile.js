const Axios = require('axios')



async function requestGetZoneDataApi(domainName, idSessionLogin, sessionLogin) {

  let res = await Axios.post(`${idSessionLogin}execute/DNS/parse_zone`, {
    zone: domainName
  }, {
    headers: {
      Cookie: `cpsession=${sessionLogin}`
    },

  })

  if (res.data.data) {
    let DnsZoneFormatted = []
    res.data.data.forEach(dnszone => {
      let tempDnszone = dnszone

      if (dnszone.dname_b64) {
        tempDnszone.dname_b64 = atob(dnszone.dname_b64)

        if (typeof (tempDnszone.data_b64) == 'string') {
          tempDnszone.data_b64 = atob(dnszone.data_b64)
        }
        if (typeof (tempDnszone.data_b64) == 'object') {
          tempDnszone.data_b64 = tempDnszone.data_b64.map(element => {
            return atob(element)
          })
        }
        DnsZoneFormatted.push(tempDnszone)
      }

    })
    DnsZoneFormatted = DnsZoneFormatted.filter(element => {
      return element.ttl === 1200
    })

    return res.data.data;
  }

}
async function requestEditZoneDataApi(domainName, idSessionLogin, sessionLogin, serialID, postData,) {

  let res = await Axios.post(`${idSessionLogin}execute/DNS/mass_edit_zone`, {
    zone: domainName,
    edit: postData,
    serial: serialID
  }, {
    headers: {
      Cookie: `cpsession=${sessionLogin}`
    },

  })

  if (res.data && res.data.errors == null) {
    console.log(`Edit ${postData} successed`)
    return {
      errors: null,
      serial: res.data.data.new_serial
    }
  } else {
    console.log(`errors ${postData}`)
    console.log(`errors ${res.data.errors}`)
    return {
      errors: res.data.errors,
    }
  }
}

async function requestAddZoneDataApi(domainName, idSessionLogin, sessionLogin, serialID, postData) {

  let res = await Axios.post(`${idSessionLogin}execute/DNS/mass_edit_zone`, {
    zone: domainName,
    add: postData,
    serial: serialID
  }, {
    headers: {
      Cookie: `cpsession=${sessionLogin}`
    },

  })
  if (res.data && res.data.errors == null) {
    console.log(`add ${postData} successed`)
    return {
      errors: null,
      serial: res.data.data.new_serial
    }
  } else {
    console.log(`errors ${postData}`)
    console.log(`errors ${res.data.errors}`)
    return {
      errors: res.data.errors,
    }
  }
}

async function requestgetSerialApi(domainName, idSessionLogin, sessionLogin) {

  let res = await Axios.post(`${idSessionLogin}execute/DNS/mass_edit_zone`, {
    zone: domainName,
    edit: '{"dname":"vkinfotechsolution.com.","ttl":1200,"record_type":"A","line_index":5,"data":["68.65.121.217"]}',
    serial: '332'
  }, {
    headers: {
      Cookie: `cpsession=${sessionLogin}`
    },

  })

  if (res.data.errors[0] && res.data.errors[0].indexOf('DNS zone’s serial number') != -1) {
    let errors = res.data.errors[0]
    let serialDns = ((errors.split('DNS zone’s serial number')[1]).split('(')[1]).split(')')[0]
    return serialDns
  }
  return ''
}
module.exports = {
  requestGetZoneDataApi,
  requestgetSerialApi,
  requestAddZoneDataApi,
  requestEditZoneDataApi,
}
