const bodyParser = require('body-parser')
const express = require('express')
const path = require('path') //not need to install its core odule so it install while npm
const mongoose = require('mongoose');
const session = require('express-session')
const expressValidator = require('express-validator');
const flash = require('connect-flash');

mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

//Check Connention
db.once('open', function(req, res){
	console.log('Connected to the mongoDb');
});


//Check for db error
db.on('error', function(req, res){
	console.log(error);
});

//App init
const app = express()

//Bring in models
let Article = require('./models/article')


//Load view Engine
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');

// body parse  middlware application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

//Add publice folder
app.use(express.static(path.join(__dirname,'public')));

app.use(express.static(path.join(__dirname, "js")));

//Express session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true/*,
  cookie: { secure: true }*/
}))

//Express Message Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
// Home Route
app.get('/', function(req, res){
  Article.find({}, function(err, articles){
    if(err){
      console.log(err);
    } else {
      res.render('index', {
        title:'Articles',
        articles: articles
      });
    }
  });
});

//Add submit POST  route
app.post('/articles/add', function(req, res){
	req.CheckBody('title','Title is required');
	req.CheckBody('author','Author is required');
	req.CheckBody('body','Body is required');

	//Get the Erroors
	let errors = req.validationError();
	if(errors){
		res.render('add_article', {
        title:'Add articles',
        errors: errors
      });

	}else{

	var article = new Article();	
	article.title = req.body.title;
	console.log(article.title);
	article.author = req.body.author;
	article.body = req.body.body;
	
	article.save(function(err){
		if(err){
			console.log(err);
			return;
		}else{
			req.flash('success', 'Article Added');
			res.redirect('/');
		}
	});
	}
});


//Get Single Article
app.get('/article/:id', function(req, res){
	Article.findById(req.params.id, function(err, article){
		res.render('article', {
		article:article

	});
	});

});

//Load Edit form
app.get('/articles/edit/:id', function(req, res){
		
	Article.findById(req.params.id, function(err, article){
		//console.log(article);
		res.render('edit_article', {
		article:article

	});
	});

});

//Update submit POST  route
app.post('/articles/edit/:id', function(req, res){	
	var article = {};
	article.title = req.body.title;
	//console.log(article.title);
	article.author = req.body.Author;
	article.body = req.body.body;
	
	let query = {_id:req.params.id}

	Article.update(query, article, function(err){
		if(err){
			console.log(err);
			return;
		}else{
			req.flash('success','Article Updated');
			res.redirect('/');
		}
	});
});

//Delete the record
app.delete('/articles/:id', function(req, res){
	let query = {_id:req.params.id}

	Article.remove(query, function(err){
		if(err){
			console.log(err);
		}
		res.send('Success');
		});

	});

//Add route
app.get('/articles/add', function(req, res){
	res.render('add_article', {
		title:'Add Article'

	});

});

//Start server
app.listen(3000, () => console.log('Example app listening on port 3000!'))
	