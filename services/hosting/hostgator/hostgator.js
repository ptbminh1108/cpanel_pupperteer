const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const apiRequestNameCheap = require('./apiZoneFile')
function getSessionLogin(Cookies) {
  return Cookies.find(cookie =>
    cookie.name == "cpsession"
  )
}




async function process(dnsZoneData, config , zoneFileDataStr) {
  // let driver = await new Builder().forBrowser(Browser.CHROME).build();
  let driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(new chrome.Options().headless().addArguments('--no-sandbox').addArguments('--disable-dev-shm-usage')).build();
  try {
    await driver.get(config.domain.replace('https', 'http'));
    await driver.wait(until.elementLocated(By.id('user')), 30000);

    // Login
    let inputUsername = await driver.findElement(By.id('user'))
    await inputUsername.sendKeys(config.username)
    let inputPassword = await driver.findElement(By.id('pass'))
    await inputPassword.sendKeys(config.password)
    let button = await driver.findElement(By.id('login_submit'));
    await button.click();

    try {
      await driver.wait(until.elementLocated(By.id('cpHordeBanner')), 10000);
    } catch (e) {
      console.log('login failed, please check data passing')
      return
    }

    // Acess DNS
    let currentUrl = await driver.getCurrentUrl()
    const IdSessionLogin = currentUrl.split('frontend/')[0]
    let urlZoneEditor = IdSessionLogin + 'frontend/jupiter/zone_editor/index.html#/list'
    await driver.navigate().to(urlZoneEditor);
    await driver.wait(until.elementLocated(By.id('filterList_input')), 30000);


    // Get list Domain 
    let domainList = []

    let spanDomainNames = await driver.findElements(By.css('#tableContainer #table .wordbreak span'))
    for (key in spanDomainNames) {
      domainList.push(await spanDomainNames[key].getText())
    }

    // find domain in domainlist

    let domainFinded = domainList.find(domain => {
      return zoneFileDataStr.indexOf(domain) != -1 ? true : false
    })

    // check if not find any domain is the same with doamin cpanel
    if (domainFinded === undefined) {
      console.log("Not find domain in dns zone");
      return
    }


    // Select List Domain
    let urlZoneEditorbyDomain = IdSessionLogin + 'frontend/jupiter/zone_editor/index.html#/manage?domain=' + domainFinded
    await driver.navigate().to(urlZoneEditorbyDomain);
    await driver.wait(until.elementLocated(By.id('search_add_record_btn')), 10000);


    // post get list DnsZone

    // url, body, headers \\ [], options \\ [])

    let allCookies = await driver.manage().getCookies()
    let sessionLogin = getSessionLogin(allCookies).value;



    const dataZonesManage = await apiRequestNameCheap.requestGetZoneDataApi(domainFinded, IdSessionLogin, sessionLogin)

    //get Serial Data
    let serial = 0;
    serial = await apiRequestNameCheap.requestgetSerialApi(domainFinded, IdSessionLogin, sessionLogin)
    if (serial == '') {
      console.log(' get serial failed')
    }

    // process DataDNSZone to serrver

    for (let index = 0; index < dnsZoneData.length; index++) {
      let dnsData = dnsZoneData[index]

      if (dnsData.type && dnsData.type != '') {
        if (dnsData.type == 'subdomain') {
          let rootDomainKeyexist = dataZonesManage.find(dataZone => {
            if (typeof (dataZone.dname_b64) != 'string') return false
            if ( dnsData.dnsData[0] == dataZone.dname_b64 && dnsData.dnsData[2] == dataZone.record_type ) return true
            return false
          })

          // add new
          if (typeof rootDomainKeyexist === "undefined") {
            let postData = `{"dname":"${dnsData.dnsData[0]}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":null,"data":["${dnsData.dnsData[3]}"]}`
            let resApi = await apiRequestNameCheap.requestAddZoneDataApi(domainFinded, IdSessionLogin, sessionLogin, serial, postData)
            if (resApi.errors == null) {
              serial = resApi.serial
            }
            // update with new data 
          } else {
            let postData = `{"dname":"${rootDomainKeyexist.dname_b64}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":${rootDomainKeyexist.line_index},"data":["${dnsData.dnsData[3]}"]}`
            let resApi = await apiRequestNameCheap.requestEditZoneDataApi(domainFinded, IdSessionLogin, sessionLogin, serial, postData)
            if (resApi.errors == null) {
              serial = resApi.serial
            }
          }
        }
        if (dnsData.type == 'domainkey') {
          let rootDomainKeyexist = dataZonesManage.find(dataZone => {
            if (typeof (dataZone.dname_b64) != 'string') return false
            if ( ( dnsData.dnsData[0] == dataZone.dname_b64 || dnsData.dnsData[0] == dataZone.dname_b64 + '.' + domainFinded + '.' ) && dnsData.dnsData[2] == dataZone.record_type ) return true
            return false
          })
          // add new
          if (typeof rootDomainKeyexist === "undefined") {
            let postData = `{"dname":"${dnsData.dnsData[0]}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":null,"data":["${dnsData.dnsData[3]}"]}`
            let resApi = await apiRequestNameCheap.requestAddZoneDataApi(domainFinded, IdSessionLogin, sessionLogin, serial, postData)
            if (resApi.errors == null) {
              serial = resApi.serial
            }
            // update with new data 
          } else {
            let postData = `{"dname":"${rootDomainKeyexist.dname_b64}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":${rootDomainKeyexist.line_index},"data":["${dnsData.dnsData[3]}"]}`
            let resApi = await apiRequestNameCheap.requestEditZoneDataApi(domainFinded, IdSessionLogin, sessionLogin, serial, postData)
            if (resApi.errors == null) {
              serial = resApi.serial
            }
          }
        }
        if (dnsData.type == 'root_domainkey') {
          let rootDomainKeyexist = dataZonesManage.find(dataZone => {
            if (typeof (dataZone.dname_b64) != 'string') return false
            return dataZone.dname_b64.indexOf('domainkey') == -1 ? false : true
          })

          // add new
          if (typeof rootDomainKeyexist === "undefined") {
            let postData = `{"dname":"${dnsData.dnsData[0]}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":null,"data":["${dnsData.dnsData[3]}"]}`
            let resApi = await apiRequestNameCheap.requestAddZoneDataApi(domainFinded, IdSessionLogin, sessionLogin, serial, postData)
            if (resApi.errors == null) {
              serial = resApi.serial
            }
            // update with new data 
          } else {
            let postData = `{"dname":"${dnsData.dnsData[0]}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":${rootDomainKeyexist.line_index},"data":["${dnsData.dnsData[3]}"]}`
            let resApi = await apiRequestNameCheap.requestEditZoneDataApi(domainFinded, IdSessionLogin, sessionLogin, serial, postData)
            if (resApi.errors == null) {
              serial = resApi.serial
            }
          }
        }
        if (dnsData.type == 'dmarc') {
          let rootDomainKeyexist = dataZonesManage.find(dataZone => {
            if (typeof (dataZone.dname_b64) != 'string') return false
            return dataZone.dname_b64.indexOf('_dmarc') == -1 ? false : true
          })

          // add new
          if (typeof rootDomainKeyexist === "undefined") {
            let postData = `{"dname":"${dnsData.dnsData[0]}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":null,"data":["${dnsData.dnsData[3]}"]}`
            let resApi = await apiRequestNameCheap.requestAddZoneDataApi(domainFinded, IdSessionLogin, sessionLogin, serial, postData)
            if (resApi.errors == null) {
              serial = resApi.serial
            }
            // update with new data 
          } else {
            let postData = `{"dname":"${dnsData.dnsData[0]}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":${rootDomainKeyexist.line_index},"data":["${dnsData.dnsData[3]}"]}`
            let resApi = await apiRequestNameCheap.requestEditZoneDataApi(domainFinded, IdSessionLogin, sessionLogin, serial, postData)
            if (resApi.errors == null) {
              serial = resApi.serial
            }
          }
        }

        if (dnsData.type == 'spf') {


          let rootDomainKeyexist = dataZonesManage.find(dataZone => {
            if ( typeof dataZone.data_b64 === 'undefined' ) return false
            if ( typeof dataZone.data_b64[0] !== 'string' ) return false
            
            return ( (dataZone.data_b64[0].indexOf('=spf1') ) == -1  || dataZone.dname_b64 != dnsData.dnsData[0] )  ? false : true
          })

          // GET LIST SPF IP
          let listSPFip = dnsData.dnsData[3].split(' ').filter((data) =>{
            return data.indexOf('ip4:') != -1 ? true : false
          })

          
          // add new
          if (typeof rootDomainKeyexist === "undefined") {
            let postData = `{"dname":"${dnsData.dnsData[0]}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":null,"data":["${dnsData.dnsData[3]}"]}`
            let resApi = await apiRequestNameCheap.requestAddZoneDataApi(domainFinded, IdSessionLogin, sessionLogin, serial, postData)
            if (resApi.errors == null) {
              serial = resApi.serial
            }
            // update with new data 
          } else {

            let listIpStr = '';
            listSPFip.forEach((ip) =>{
              listIpStr += ip + ' '
            })
            listIpStr += '-all'
            // listSPFip
            
            let spfNewData = ''
            spfNewData = rootDomainKeyexist.data_b64[0].replace('-all' , listIpStr )
            spfNewData = rootDomainKeyexist.data_b64[0].replace('?all' , listIpStr )
            spfNewData = rootDomainKeyexist.data_b64[0].replace('~all' , listIpStr )
            // let dataDnsPost = 
            let postData = `{"dname":"${rootDomainKeyexist.dname_b64}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":${rootDomainKeyexist.line_index},"data":["${spfNewData}"]}`
            let resApi = await apiRequestNameCheap.requestEditZoneDataApi(domainFinded, IdSessionLogin, sessionLogin, serial, postData)
            if (resApi.errors == null) {
              serial = resApi.serial
            }
          }
        }
      }
    }

  } catch (e) {
    console.log("Please check domain , it may be cann't be reached")
  } finally {
    await driver.quit();
  }
}

module.exports = process