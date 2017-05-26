'use strict'
const express=require('express')
const app = express();
const bodyParser = require('body-parser');
const marked = require('marked')
const methodOverride = require('method-override')

//const hljs = require('highlight.js')
const pygmentize=require('pygmentize-bundled')
const port = process.env.PORT || 3000



app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(methodOverride("_method"))


const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
//const uri = "mongodb://mongoadmin:quark8751@cluster0-shard-00-00-abnxv.mongodb.net:27017,cluster0-shard-00-01-abnxv.mongodb.net:27017,cluster0-shard-00-02-abnxv.mongodb.net:27017/markdownDB?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin"
const uri = "mongodb://localhost/markdownDB"

mongoose.connect(uri);
const markdownSchema = new mongoose.Schema({
  title: String,
  body: String,
  unmarked: String,
  created: {type: Date, default: Date.now},
  lastUpdated: {type: Date, default: Date.now}
})
const markdownModel = mongoose.model('blog', markdownSchema)
// markdownModel.create({
//   title:"my first blog",
//   body: "this is my first blog"
// }, (err, res) => {
//   if (err) {
//     console.log('error inserting in to markdownDB')
//   } else {
//     console.log(res)
//     console.log('success insertion')
//   }
// })



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
  res.redirect('blogs')
})


// NEW
app.get('/blogs/new', function(req,res) {
  res.render('new')
})




// CREATE
app.post('/addEntry', function(req,res) {
  //req.body.blog.body = req.sanitize(req.body.blog.body)
  marked(req.body.blog.body, function (err, content) {
    if (err) throw err;
    req.body.blog.unmarked = req.body.blog.body
    req.body.blog.body = content;
    markdownModel.create(
      req.body.blog, (err, blog) => {
        if (err) {
          console.log('-----------------------')
          console.log('error inserting')
          console.log(err)
          console.log(blog)
          console.log('-----------------------')
        } else {
          console.log('here is what got inserted:')
          console.log('-----------------------------')
          console.log(blog)
          console.log('-----------------------------')
          res.redirect('/')
        }
      }
    )
  });



})


// INDEX
app.get('/blogs', function(req, res) {
  const promise = markdownModel.find({}).exec();
  promise.then((blogs) => {
     //console.log('then promise')
     res.render('index', {blogs: blogs})
  })
  .catch( (err) => {
    console.log('[INDEX] error fetching document: ', err.message)
  })
})


// SHOW
app.get('/blogs/:id', function(req, res) {
  const id = req.params.id;
  //res.render('show',{blog: id})
  const promise = markdownModel.findById(id).exec();
  promise.then((blog) => {
     //console.log('then promise')
     res.render('show', {blog: blog})
  })
  .catch( (err) => {
    console.log('[SHOW] error fetching document: ', err.message)
  })
})

// EDIT
app.get('/blogs/:id/edit', (req,res) => {
  const id = req.params.id;
  markdownModel.findById(id, (err, blog) => {
    if (err) {
      res.redirect('shotPost')
    } else {
      console.log(blog)
      res.render('edit', {blog: blog})
    }
  })
})


// UPDATE
app.put('/blogs/:id', (req, res) => {
  marked(req.body.blog.body, function (err, content) {
    if (err) throw err;
    req.body.blog.unmarked = req.body.blog.body
    req.body.blog.body = content;
    req.body.blog.lastUpdated = Date.now();
    markdownModel.findByIdAndUpdate(
      req.params.id,
      req.body.blog,
      (err, blog) => {
        if (err) {
          console.log('error updating blog')
          res.redirect('/showPost')
        } else {
          console.log(blog)
          res.redirect('/showPost');
        }
      }
    )
  });


})

// DESTROY
app.delete('/blogs/:id', (req, res)=> {
  const id = req.params.id;
  markdownModel.findByIdAndRemove(id, (err, doc) => {
    if (err) {
      console.log('cannot delete '+id+' from db')
      res.redirect('/showPost')
    } else {
      console.log('successfully deleted document "' + doc.title +'"')
      res.redirect('/showPost')
    }
  })
})

app.listen(port, function() {
  console.log('server started!');
})
