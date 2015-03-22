
var express=require('express');
var config=require('./server/configure');
var app=express();
var mongoose=require('mongoose');

app.set('port',process.env.PORT || 3300);
app.set('views',__dirname+'/views');
app=config(app);

mongoose.connect('mongodb://localhost/imgUploader');
mongoose.connection.on('open',function(){
	console.log('Connected to mongoose');
});

var server=app.listen(app.get('port'),function(){
	console.log('Server up: http://localhost:'+app.get('port'));
});