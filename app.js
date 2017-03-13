'use strict'
const express=require('express')
const app = express();
const bodyParser = require('body-parser');
const marked = require('marked')
//const hljs = require('highlight.js')
const pygmentize=require('pygmentize-bundled')
const port = process.env.PORT || 3000



app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));




/**
// marked options for hljs
// see https://github.com/chjj/marked/issues/393 for langPrefix hljs
marked.setOptions({
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  },
  langPrefix: 'hljs '
});


// @chikathreesix solution
const renderer = new marked.Renderer();
renderer.code = function(code, language){
  return '<pre><code class="hljs ' + language + '">' +
    hljs.highlight(language, code).value +
    '</code></pre>';
};
*/



// marked options for node-pygmentize

marked.setOptions({
  highlight: function (code, lang, callback) {
    require('pygmentize-bundled')({ lang: lang, format: 'html' }, code, function (err, result) {
      callback(err, result.toString());
    });
  }
});




// Markdown testing

var msg =   marked('# Marked in browser\n\n ## Rendered by *marked*.');
var markdownString = 'hithere ```js\n console.log("hello"); \n```';


//var msg2 = marked(markdownString)
var msg2;
 marked(markdownString, function (err, content) {
  if (err) throw err;
  //console.log(content);
  msg2 = content
});
//console.log(markdownString)
//console.log(msg2)




// Home page
app.get('/', function(req,res) {
    res.render("home",{msg: msg, msg2: msg2});
})


// Create new blog post
app.get('/newBlogPost', function(req,res) {
  res.render('newBlogPost')
})


// content is the text from input box (the blog post)
let content = {};

// handle the post request for new blog post
app.post('/addEntry', function(req,res) {
  content = req.body;
  console.log(content);
  res.redirect('showPost')
})


// show the new blog post
// rendered wihin marked callback
app.get('/showPost', function(req, res) {

  const entryBody = content.entryBody;
  const entryTitle = content.entryTitle;
  const entryDate = "Friday, Dec 2nd 2016"

// start node-pygmentize

  marked(entryBody, function (err, content) {
   if (err) throw err;
   const markedEntryBody = content;
   console.log(markedEntryBody);
   res.render('showPost', {markedEntryBody: markedEntryBody, entryTitle: entryTitle, entryDate: entryDate})
 });
 // end node-pygmentize


// start @chikathreesix
 // const markedEntryBody = marked(entryBody, {renderer: renderer});
// res.render('showPost', {markedEntryBody: markedEntryBody, entryTitle: entryTitle, entryDate: entryDate})
// end @chikathreesix
})

app.listen(port, function() {
    console.log('server started!');
})
