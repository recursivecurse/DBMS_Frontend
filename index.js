const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
var  mysql = require('mysql');

const connection = mysql.createConnection({

	host    :  'localhost', 
	user	:  'root'	  ,
	password:  'Aditya@7771',
	database:  'hostel_management'

});

connection.connect();

var urlencodedParser  =  bodyParser.urlencoded({extended: false});

app.use(express.static(path.join(__dirname,'public')));
// app.use(bodyParser.urlencoded({ extended: true }));

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
});

//Sending form data to /create_student_database 

app.post('/create_student_table',urlencodedParser,(req,res)=>{
	// console.log(req.body.st_fullname);
	var St_fullname = req.body.st_fullname;
	var St_usn = req.body.st_usn;
	var St_cgpa = req.body.st_cgpa;
	var St_branch = req.body.st_branch;
	var St_email = req.body.st_email;

	// console.log(st_fullname + " " + st_usn + " " + st_email + " " + st_cgpa + " ");
	// connection.connect();
	var posts = {usn: St_usn, name: St_fullname, cgpa: St_cgpa, branch: St_branch, email: St_email };
	// var query_student_table = "insert into student set ?('"req.body.st_usn +"','"+ req.body.st_fullname +"','"+ req.body.st_cgpa +"','"+ req.body.st_branch +"','"+ req.body.st_email +"')"
	connection.query('insert into student set ?',posts,function(error,results,fields){
		if(error) throw error;
		console.log(results);
	});
	// connection.end();
	res.redirect('/');
});

//Sending employee data to /create-admin-table

app.post('/create-admin-table',urlencodedParser,(req,res)=>{

	//console.log(req.body.isMessEmployee);
	if(req.body.isMessEmployee == 1)
	{
		var admin_posts = {empID: req.body.ad_id, name: req.body.ad_name, designation: req.body.ad_des,phoneNumber: req.body.ad_no};
		connection.query('insert into MessEmployee set ?',admin_posts,function(error,results,fields){
			if(error) throw error;
			console.log(results);

		});
		res.redirect('/admin');
	}
	else{

		var mess_posts = {empID: req.body.ad_id, name: req.body.ad_name, designation: req.body.ad_des,phoneNumber: req.body.ad_no};
		connection.query('insert into HostelAdmin set ?',mess_posts,function(error,results,fields){
			if(error) throw error;
			console.log(results);
		});

		res.redirect('/admin');
	}
	
});

app.listen(8080,()=>{
	console.log("Listening at port 8080.");
});