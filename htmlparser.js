var express = require ('express');
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('port', process.env.PORT || 3001);

// for url parsing : http://www.codingdefined.com/2014/11/how-to-parse-urls-in-nodejs.html
var url = require("url");

// for file IO - https://nodejs.org/docs/v0.10.35/api/fs.html
var fs = require('fs')

// convert html text to DOM
//http://dillonbuchanan.com/programming/html-scraping-in-nodejs-with-cheerio/
var cheerio = require('cheerio');
var request = require('request');

// 2017-10-21 trying jsdom version instead of cheerio
// https://github.com/tmpvar/jsdom
var jsdom = require("jsdom");
const { JSDOM } = jsdom;






function parsehtml(textin, res) {
  console.log ("starting parsehtml");
  var n = 0
  n = textin.indexOf("a href=");
  console.log ("n = "+n);
  
  //for (var i = 0, len = textin.length; i) {
  //  if (str.chjarAt(i) == "<")
  //}
  
  textin2 = textin.toString();
  for (var v of textin2) {
    console.log (v);
  }
  
  res.type('text/plain');
  res.send(textin);
}

//
// http://coursesweb.net/javascript/url-data-domain-name-path-file-search-hash_cs
//
function urlData(url){ // From: http://coursesweb.net/javascript/
  // object that will be returned
  var re = {protocol:'', domain:'', port:80, path:'', file:'', search_str:'', search_obj:{}, hash:''};

  // creates an anchor element, and adds the url in "href" attribute
  var a_elm  = document.createElement('a');
  a_elm.href = url;

  // adds URL data in re object, and returns it
  re.protocol = a_elm.protocol.replace(':', '');
  re.domain = a_elm.hostname.replace('www.', '');
  if(a_elm.port !='') re.port = a_elm.port;
  re.path = a_elm.pathname;
  if(a_elm.pathname.match(/[^\/]+[\.][a-z0-9]+$/i) != null) re.file = a_elm.pathname.match(/[^\/]+[\.][a-z0-9]+$/i)[0];
  re.search_str = a_elm.search.replace('?', '');

  //get search-data into an object {name:value}, in case there are multiple pairs name=value
  var src_data = re.search_str.split('&');
  for(var i=0; i<src_data.length; i++){
    var ar_val = src_data[i].split('=');   //separate name and value from each pair
    re.search_obj[ar_val[0]] = ar_val[1];
  }

  re.hash = a_elm.hash.replace('#', '');  //get #hash part
  return re;
}

// ***********************************
// ******** ROUTES *******************
// ***********************************

// ----------------------------------
// user interface to test parser
// ----------------------------------
app.get ('/', function (req, res) {
  var htmlin = "submiturl.html";
  // fs.readFile Asynch reads file
  console.log("starting to read");
 
  fs.readFile(htmlin, {enoding: 'utf8'}, function (err, data) {
    if (err) { //throw err;
      console.log("error readFileSync");
      throw err;
      return;
    }
    console.log(data);
    screenout = data;
    
    res.type('html');
    res.send(screenout);
  });
});

// -----------------------------------
// primary post URL route
// -----------------------------------
app.post ('/url', function (req, res) {
  var urlstring = req.body.urlstring;
  var results = {}; // don't use new Array() to initialize, easier convert to json
  
  // get protocol, hostname, port
  console.log("######## req.headers ########");
  console.log(req.headers);
  console.log ("####### req.body #######");
  console.log(req.body);
  
  // check for empty urlstring
  if (urlstring == "") {
    res.status(400).send("Bad Request");
    return;
  }


















/*
  JSDOM.fromURL('https://google.com', {
    runScripts: 'dangerously'
  }).then(dom => {
    console.log ("#### using .fromURL method ####");
    console.log(dom.serialize());
    console.log (dom.window.document.querySelectorAll("a"));
    console.log ("grab href");
    //console.log (dom.window.document.getElementByID("a").href);
    console.log ("grab text");
    //console.log (dom.window.document.querySelector("p").textContent);
  });
  //console.log (dom.window.document.querySelector("p").textContent);
*/
/****** 
  // testing jsdom method of parsing html
  const dom = new JSDOM(``, {
    //url: urlstring,
    url: "https://google.com",
    runScripts: "dangerously",
    contentType: "text/html",
    includeNodeLocations: true   
  });

  // if the urlstring is not valid, JSDOM will throw error "Invalid URL"
  //
  console.log ("##### here is the dom #####");
  console.log (dom);
  console.log (dom.serialize());
  console.log (dom.window.document);

  // test if there is a dom returned
  console.log ("#### Test dom ####");
  const testdom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
  console.log (testdom.window.document);
  console.log (testdom.serialize());
  console.log (testdom.window.document.querySelector("p").textContent);
  console.log (dom.window.document.querySelector("p").textContent);


  //console.log (dom.serialize());
  // get the url from document
  console.log ("#### here is the URI #####");
  console.log (dom.window.document.uri);
  console.log (JSON.stringify(dom.window.document.querySelectorAll("a")));
  var hrefArray = JSON.stringify(dom.window.document.querySelectorAll("a"));
  for (var i in hrefArray) {
    console.log(hrefArray[i]);
  }
  // get the componenets 
  console.log (dom.window.document.body);
  const document = dom.window.document;
  const bodyEl = document.body;
  const aEl = document.querySelector("a");
  console.log (aEl);
  // # of links
  var numLinks = dom.window.document.links.length;
  console.log ("numLinks = "+numLinks);
  console.log ("dom.window.document.links = " + dom.window.document.links[0]);
*/
/*
  jsdom.env ({
    url: urlstring, 
    scripts: ['http://code.jquery.com/jquery-1.5.min.js']
  }, function (err, window) {
    var $ = window.jQuery;
    console.log($);
  });
*/












  request (
    { method: 'GET',
      uri: urlstring }, 
    function (err, response, body) {
      if (err) {
        console.error("#### FOUND ERROR: "+ err); 
        res.status(204).send("No urls found in this html (!)");
        return;
      }
      //console.log(body);
      
      // load html
      $ = cheerio.load(body);
      $('a').each(function(index) {
        results[index] = $(this).attr('href')
        console.log ("links = "+results[index]);
      });

      console.log ($.url);
      console.log ($.documentURI);
      //console.log(results.toString());
      
      // check if empty
      // TODO: test with empty HTML
      
      // cleanup url
      //console.log(results);
      
      var jsonArray = JSON.parse(JSON.stringify(results))
      /*
       console.log(uri);
      var parsedUrl = url.parse(uri, true, true);
      console.log ('Protocol is: ', parsedUrl.protocol);
      console.log ('hostname is: ', parsedUrl.hostname);
      console.log ('port is: ', parsedUrl.port); 
	*/
      
      var cleanUrlList = {};	
      var z = 0;
      var newURL;
      for (var x in jsonArray) {
        //console.log(jsonArray[x].charAt(0));
        
	// -----------------------------
        // Check for urls start with "/"
        // -----------------------------
	if ((jsonArray[x].charAt(0) == "/") ||
            (jsonArray[x].charAt(0) == "#") ||
            (jsonArray[x].charAt(0) == "?")) 
        {
	  //console.log(jsonArray[x]);
 	  newURL = "http:???" + jsonArray[x];
	  console.log(newURL);
          jsonArray[x] = newURL
	} else {
	  cleanUrlList[z] = jsonArray[x];
	  z++;
        }
      }
      //console.log ("cleanUrlList: "+cleanUrlList);
      //console.log ("stringify cleanUrlList: "+JSON.stringify(cleanUrlList));
      //res.send(jsonArray);
      res.send (cleanUrlList);
  });
});



// get html from a url and scrape it
app.get ('/url', function (req, res) {
  var urlstring = "https://www.google.com/"
  var results = new Array();

  request (
    {
      method: 'GET',
      uri: urlstring
    }, 
    function (err, response, body) {
      if (err) {
         return console.error("#### FOUND AN ERROR: "+err);
      }

      console.log(body);
      
      // load html
      $ = cheerio.load(body);
      $('a').each(function(index) {
        results[index] = $(this).attr('href')
        console.log ("links = "+results[index]);
      });
      console.log(results.toString());

      res.type('text/plain');
      res.send(results.toString());

  });
  
  //Don't output here becuase asynch call!
  //res.type('text/plain');
  //res.send(testout);
});


// ******* LEGACY TEST ROUTES **********
app.get ('/write', function (req, res) {
  
  // test write out to a txt file
  // fs.writeFile ASynchronously writes data to file, replacing if it already exists
  var str = "My string of text2345";
  console.log('str = '+str);
  fs.writeFile('testout.txt', str, function (err) {
    console.log('test write start');  
    if (err) { //throw err;
      console.log("error writeFileSync");
      throw err;
      return;
    }
    console.log('Saved the file');
  });
  
  res.type('text/plain');
  res.send('test /write path v2');
});



app.get ('/read', function (req, res) {
  
  var screenout = "blank";
  var htmlin = "craigslist_test2.txt";
  // test read a txt file
  // fs.readFile Asynch reads file
  console.log("starting to read");
 
  fs.readFile(htmlin, {enoding: 'utf8'}, function (err, data) {
    if (err) { //throw err;
      console.log("error readFileSync");
      throw err;
      return;
    }
    console.log(data);
    screenout = data;
    //res.type('text/plain');
    //res.send(data); 
    //res.send(screenout);
    
    parsehtml(screenout, res); 

  });
  
  //res.type('text/plain');
  //res.send(screenout); 
});

app.listen(app.get('port'), function() {
  console.log('Express sever started on http://localhost:'+
    app.get('port')+'; ctr-c to terminate');
});


