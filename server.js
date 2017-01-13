/* Scraper: Server #3  (18.2.1)
 * ========================= */

// Dependencies:
var express = require("express");
var bodyParser = require("body-parser");
//var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Mongoose mpromise deprecated - use bluebird promises
//var Promise = require("bluebird");
//mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
//app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_hrhdccs6:5r8ijbvo4fqd4qu4d8ijdpu08v@ds163758.mlab.com:63758/heroku_hrhdccs6");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});
app.get("/", function(req, res){
  res.send(index.html);
})
app.post("/submit", function(req, res){
  console.log(req.body);
  var newnote = new Note(req.body);
  newnote.save(function(error, saved){
    console.log(req.body);
    if(error) throw error;
    console.log(saved);
  })
})
app.get("/delete/:id", function(req, res){
  db.notes.remove({
    "_id": mongojs.ObjectID(req.params.id)}, 
    function(error, removed){
      if (error) throw error;
      console.log(removed);
    
  })
})
app.get("/scrape", function(req, res){
  // Run request to grab the HTML from awwards's clean website section
  request("http://venturebeat.com/", function(error, response, html) {

    // Load the HTML into cheerio
    var $ = cheerio.load(html); 

    // With cheerio, look at each award-winning site, enclosed in "figure" tags with the class name "site"
    $("article header h2").each(function(i, element) {
      var result = {};
      //var imgLink = $(element).find("a").find("img").attr("src");
      result.title = $(this).children("a").attr("title");
      // Save the href value of each link enclosed in the current element
      result.link = $(this).children("a").attr("href");
      if(result.title && result.link){
        var entry = new Article(result);
        var upsertData = entry.toObject();
        delete upsertData._id;
        Article.update({_id: entry.id}, upsertData, {upsert: true}, function(err, docs){
          if(err){
            console.log(err);
          }else {
            console.log(docs);
          }
        });
        /*entry.save(function(err,doc){
          if(err) {
            console.log(err);
          }else{ 
            console.log(doc);
            //res.json(doc);
          }
        }); */ 
      }
      
    });

  }); 

});
app.get("/articles", function(req, res){
  Article.find({}, function(error, doc){
    if(error){
      res.send(error);
    }else{
      res.json(doc);
    }
  });
});
app.get("/articles/:id", function(req, res) {
  Article.findOne({_id:req.params.id}).populate("note").exec(function(error, doc){
    if(error){
      res.send(error);
    }else{
      res.send(doc);
    }
  });
});
app.post("/articles/:id", function(req, res) {

  var notez = new Note(req.body);
  notez.save(function(error, doc){
    if(error){
      res.send(error);
    }else{
      Article.findOneAndUpdate({_id:req.params.id}, {"note": doc._id}, {new: true}, function(err, newdoc){
        if(err){
          res.send(err);
        }else{
          res.send(newdoc);
        }
      });
    }
  });
});
app.listen(process.env.PORT || 3000, function(){
  console.log("CONNECTED BOTCHd");
})