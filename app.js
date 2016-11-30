'use strict'
const express=require('express')
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const pygmentize=require('pygmentize-bundled')





app.set('view engine', 'ejs');
app.use(express.static("public"));
var marked = require('marked')
const hljs = require('highlight.js')

// marked.setOptions({
//   highlight: function (code) {
//     return require('highlight.js').highlightAuto(code).value;
//   },
//   langPrefix: 'hljs '
// });
marked.setOptions({
  highlight: function (code, lang, callback) {
    require('pygmentize-bundled')({ lang: lang, format: 'html' }, code, function (err, result) {
      callback(err, result.toString());
    });
  }
});
//console.log(marked('I am using __markdown__.'))

var msg =   marked('# Marked in browser\n\n ## Rendered by *marked*.');
var markdownString = '```js\n console.log("hello"); \n```';


//var msg2 = marked(markdownString)
var msg2;
 marked(markdownString, function (err, content) {
  if (err) throw err;
  //console.log(content);
  msg2 = content
});
//console.log(markdownString)
//console.log(msg2)
app.get('/', function(req,res) {
    res.render("home",{msg: msg, msg2: msg2});
})



app.get('/newBlogPost', function(req,res) {
  res.render('newBlogPost')
})

let content = {};
app.post('/addEntry', function(req,res) {
  content = req.body;
  console.log(content);

  res.redirect('showPost')
})

app.get('/showPost', function(req, res) {

  const entryBody = content.entryBody;
  const entryTitle = content.entryTitle;

  marked(entryBody, function (err, content) {
   if (err) throw err;
   const markedEntryBody = content;
   console.log(markedEntryBody);
   res.render('showPost', {markedEntryBody: markedEntryBody, entryTitle: entryTitle})
 });


})

app.listen(3000, function() {
    console.log('server started!');
})
