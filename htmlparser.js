var express = require ('express');
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('port', process.env.PORT || 3001);


// for file IO - https://nodejs.org/docs/v0.10.35/api/fs.html
var fs = require('fs')

// convert html text to DOM
//http://dillonbuchanan.com/programming/html-scraping-in-nodejs-with-cheerio/
var cheerio = require('cheerio');
var request = require('request');


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


// ***********************************
// ******** ROUTES *******************
// ***********************************

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
  
  request (
    {
      method: 'GET',
      uri: urlstring
    }, 
    function (err, response, body) {
      if (err) return console.error(err);
      console.log(body);
      
      // load html
      $ = cheerio.load(body);
      $('a').each(function(index) {
        results[index] = $(this).attr('href')
        console.log ("links = "+results[index]);
      });
      //console.log(results.toString());
      
      var jsonArray = JSON.parse(JSON.stringify(results))
      console.log(jsonArray)
      //res.type('text/plain');
      //res.send(results.toString());
      //res.send (results);
      res.send(jsonArray);
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
      if (err) return console.error(err);
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


