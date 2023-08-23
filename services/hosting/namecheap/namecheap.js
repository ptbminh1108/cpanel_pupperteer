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




async function process(dnsZoneData, config) {
  // let driver = await new Builder().forBrowser(Browser.CHROME).build();
  let driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(new chrome.Options().headless()).build();
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

    // Select List Domain
    let urlZoneEditorbyDomain = IdSessionLogin + 'frontend/jupiter/zone_editor/index.html#/manage?domain=' + domainList[0]
    await driver.navigate().to(urlZoneEditorbyDomain);
    await driver.wait(until.elementLocated(By.id('search_add_record_btn')), 10000);


    // post get list DnsZone

    // url, body, headers \\ [], options \\ [])

    let allCookies = await driver.manage().getCookies()
    let sessionLogin = getSessionLogin(allCookies).value;

    for (let countDomainList = 0; countDomainList < domainList.length; countDomainList++) {
      console.log(`processing Domain ${domainList[countDomainList]}`)

      const dataZonesManage = await apiRequestNameCheap.requestGetZoneDataApi(domainList[countDomainList], IdSessionLogin, sessionLogin)

      //get Serial Data
      let serial = 0;
      serial = await apiRequestNameCheap.requestgetSerialApi(domainList[countDomainList], IdSessionLogin, sessionLogin)
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
              return dataZone.dname_b64.indexOf(dnsData.dnsData[0]) == -1 ? false : true
            })

            // add new
            if (typeof rootDomainKeyexist === "undefined") {
              let postData = `{"dname":"${dnsData.dnsData[0]}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":null,"data":["${dnsData.dnsData[3]}"]}`
              let resApi = await apiRequestNameCheap.requestAddZoneDataApi(domainList[0], IdSessionLogin, sessionLogin, serial, postData)
              if (resApi.errors == null) {
                serial = resApi.serial
              }
              // update with new data 
            } else {
              let postData = `{"dname":"${dnsData.dnsData[0]}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":${rootDomainKeyexist.line_index},"data":["${dnsData.dnsData[3]}"]}`
              let resApi = await apiRequestNameCheap.requestEditZoneDataApi(domainList[0], IdSessionLogin, sessionLogin, serial, postData)
              if (resApi.errors == null) {
                serial = resApi.serial
              }
            }
          }
          if (dnsData.type == 'domainkey') {
            let rootDomainKeyexist = dataZonesManage.find(dataZone => {
              if (typeof (dataZone.dname_b64) != 'string') return false
              return dataZone.dname_b64.indexOf(dnsData.dnsData[0]) == -1 ? false : true
            })

            // add new
            if (typeof rootDomainKeyexist === "undefined") {
              let postData = `{"dname":"${dnsData.dnsData[0]}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":null,"data":["${dnsData.dnsData[3]}"]}`
              let resApi = await apiRequestNameCheap.requestAddZoneDataApi(domainList[0], IdSessionLogin, sessionLogin, serial, postData)
              if (resApi.errors == null) {
                serial = resApi.serial
              }
              // update with new data 
            } else {
              let postData = `{"dname":"${dnsData.dnsData[0]}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":${rootDomainKeyexist.line_index},"data":["${dnsData.dnsData[3]}"]}`
              let resApi = await apiRequestNameCheap.requestEditZoneDataApi(domainList[0], IdSessionLogin, sessionLogin, serial, postData)
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
              let resApi = await apiRequestNameCheap.requestAddZoneDataApi(domainList[0], IdSessionLogin, sessionLogin, serial, postData)
              if (resApi.errors == null) {
                serial = resApi.serial
              }
              // update with new data 
            } else {
              let postData = `{"dname":"${dnsData.dnsData[0]}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":${rootDomainKeyexist.line_index},"data":["${dnsData.dnsData[3]}"]}`
              let resApi = await apiRequestNameCheap.requestEditZoneDataApi(domainList[0], IdSessionLogin, sessionLogin, serial, postData)
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
              let resApi = await apiRequestNameCheap.requestAddZoneDataApi(domainList[0], IdSessionLogin, sessionLogin, serial, postData)
              if (resApi.errors == null) {
                serial = resApi.serial
              }
              // update with new data 
            } else {
              let postData = `{"dname":"${dnsData.dnsData[0]}","ttl":1200,"record_type":"${dnsData.dnsData[2]}","line_index":${rootDomainKeyexist.line_index},"data":["${dnsData.dnsData[3]}"]}`
              let resApi = await apiRequestNameCheap.requestEditZoneDataApi(domainList[0], IdSessionLogin, sessionLogin, serial, postData)
              if (resApi.errors == null) {
                serial = resApi.serial
              }
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