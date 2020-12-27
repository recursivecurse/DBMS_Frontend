const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname,'public')));
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));

app.get('/',(req,res)=>{
	res.render('home');
});
app.get('/admin',(req,res)=>{
	res.render('admin');
});

app.get('/student-sign-up',(req,res)=>{
	res.render('student-sign-up');
});

app.get('/admin-sign-up',(req,res)=>{
	res.render('admin-sign-up');
})

app.listen(8080,()=>{
	console.log("Listening at port 8080.");
});