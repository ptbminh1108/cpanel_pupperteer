INSTALLATION
  + Get node in your computer (here : https://nodejs.org/en/download)
  + In project folder ( have package.json file ) type  "npm install" to download necessary modules 

RUNNING
  + IN project folder ( have main.js file) type   
    "node main.js" 
  
  + The hosting data LOGIN ( include: domain:port|username|password|hostingService|ZoneFileName) is store /data/cpanel.txt
    (    https://vkinfotechsolution.com:2083|vkinnfqj|Cjk1VDhr9QwF|hostgator|example.zonefile.txt      )

  + IN ZONE FILE YOU SHOULD ADD #start# at the line befor the data you want to add to cpanel
                                #end# at the end the line after  you want to add to cpanel
    #start#
    ...DNS data...
    #end#
  (watch in zonefile example.zonefile.txt line 92 (#start#) and 127 (#end#) )