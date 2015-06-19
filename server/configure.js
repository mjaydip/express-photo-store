
var express=require('express');
var path=require('path');
var routes=require('./routes');
var exphbs=require('express-handlebars');
var moment = require('moment');
var fs=require('fs');
var morgan=require('morgan');
var bodyParser=require('body-parser');
var multer=require('multer');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorhandler = require('errorhandler');

module.exports=function(app){
	app.engine('handlebars',exphbs.create({
		'defaultLayout': 'main',
		'layoutsDir': app.get('views')+'/layouts',
		'partialsDir': [app.get('views')+'/partials'],
		helpers: {
            timeago: function(timestamp) {
                console.log(timestamp);
                return moment(timestamp).startOf('minute').fromNow();
            }
        }
	}).engine);
	app.set('view engine','handlebars');
	app.use(morgan('combined'));
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(multer({ dest: path.join(__dirname,'../public/upload')}));
	app.use(methodOverride('X-HTTP-Method-Override'));
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname,'../public')));
	if('development'===app.get('env')){
		app.use(errorhandler());
	}
	routes.initialize(app);
	//Ensure the temporary upload folder exists
	//fs.exists(path.join(__dirname,'../public/upload/temp'),function(exists){
	//	if(!exists){
	//		fs.mkdir(path.join(__dirname,'../public/upload'),function(err){
	//			console.log(err);
	//			fs.mkdir(path.join(__dirname,'../public/upload/temp'),function(err){
	//				console.log(err);
	//			});
	//		})
	//	}
	//});
	return app;
};