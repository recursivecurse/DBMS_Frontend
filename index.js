const express = require('express');
const path = require('path');
const flash = require('connect-flash');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var  mysql = require('mysql');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var multer = require('multer');
var fs = require('fs');
const connection = mysql.createConnection({

	host    :  'localhost', 
	user	:  'root'	  ,
	password:  'Aditya@7771',
	database:  'hostel_management'

});

connection.connect();

mongoose.connect("mongodb://localhost/hostelManagement",{useNewUrlParser: true});

mongoose.connection
	.once("open",()=> console.log("Connected to MongoDB"))
	.on("error",error => {
		console.log("Your error",error);
	});

//Schema Mongodb

// Feedback
var Schema = mongoose.Schema;
var Feedback = new Schema({
	St_feedback: String 
});
var feedback = mongoose.model("feedback",Feedback);


//Poll 
var Poll = new Schema({

	_id : Number ,
	title: String , 
	ques: String , 
	option1: String , 
	option2: String , 
	option3: String ,
	option4: String ,
	ansop1 : Number ,
	ansop2 : Number ,
	ansop3 : Number ,
	ansop4 : Number

});
var poll = mongoose.model("poll",Poll);

//image receit
 
var imageSchema = new mongoose.Schema({
    usn: String,
    img: String
    // {
    //     data: Buffer,
    //     contentType: String
    // }
});

var imgModel = new mongoose.model('Image', imageSchema);
// module.exports=imgModel;
//configuring multer

var storage = multer.diskStorage({
	destination:"./public/uploads/",
	// (req, file, cb) => {
    //     cb(null, 'uploads')
    // },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now()+path.extname(file.originalname));
    }
});

var upload = multer({ storage: storage }).single('image');


// Step 6 - load the mongoose model for Image 
// var imgModel = require('./model');


var urlencodedParser  =  bodyParser.urlencoded({extended: false});

app.use(express.static(path.join(__dirname,'./public/')));
app.use(cookieParser());
app.use(session({
	secret:'secret123' ,
	saveUninitialized: true ,
	resave: true
}));
app.use(flash());

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

	console.log(req.body.st_roomNo);
	// req.flash('roomNo',req.body.st_roomNo);
	// req.flash('StUSN',req.body.st_usn);
	// console.log(st_fullname + " " + st_usn + " " + st_email + " " + st_cgpa + " ");
	// connection.connect();
	var posts = {usn: St_usn, name: St_fullname, cgpa: St_cgpa, branch: St_branch, email: St_email };
	// var query_student_table = "insert into student set ?('"req.body.st_usn +"','"+ req.body.st_fullname +"','"+ req.body.st_cgpa +"','"+ req.body.st_branch +"','"+ req.body.st_email +"')"
	connection.query('insert into student set ?',posts,function(error,results,fields){
		if(error) throw error;
		console.log(results);
	});
	// connection.end();
	var posts = {roomNo: req.body.st_roomNo , allocated_usn: req.body.st_usn , vacancy: 'Not Vacant'};

	connection.query('insert into Rooms set ?',posts,function(error,results,fields){
		if(error) throw error;
		console.log(results);
	});
	res.redirect('/');
});

// app.post('/post_student_room',urlencodedParser,(req,res)=>{

	
// });

//Sending employee data to /create-admin-table

app.post('/create-admin-table',urlencodedParser,(req,res)=>{

	//console.log(req.body.isMessEmployee);
	if(req.body.isMessEmployee == 1)
	{
		var admin_posts = {mempID: req.body.ad_id, name: req.body.ad_name, designation: req.body.ad_des,phoneNumber: req.body.ad_no};
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

//Evaluate user

app.post('/eval-user',urlencodedParser,(req,res)=>{
	var id = req.body.identity;
	req.flash('unique_id',id);
	if(id.includes("1RV18")){
		res.redirect('/st-dashboard');

	}
	else{
		res.redirect('/ad-dashboard');
	}
});

//Student Dashboard
app.get('/st-dashboard',(req,res)=>{

	// res.render('student-dashboard');
	var id = req.flash('unique_id');
	req.flash('presence-id',id);
	console.log(id);
	var q_data = `select * from student where usn="${id}" `;
	connection.query(q_data, function(error,results,fields){
		if(error) throw error;

		res.render('student-dashboard',{st_name: results[0].name , st_usn: results[0].usn});
	});

});
//Admin Dashboard

app.get('/ad-dashboard',(req,res)=>{
	var id = req.flash('unique_id');
	// console.log(id[0]);
	if(id[0].includes('memp')){
		console.log('yes');
		var q_data = `select * from MessEmployee where mempID="${id}" `;
		connection.query(q_data, function(error,results,fields){
		if(error) throw error;

		// console.log(results);
		res.render('admin-dashboard',{st_name: results[0].name , st_usn: results[0].designation});
	});

	}
	else{
		var q_data = `select * from HostelAdmin where empID="${id}" `;
		connection.query(q_data, function(error,results,fields){
		if(error) throw error;

		// console.log(results);
		res.render('admin-dashboard',{st_name: results[0].name , st_usn: results[0].designation});
	});
	}
	

});

// Admin Live Poll

app.get('/admin-poll',(req,res)=>{

	// res.render('admin-poll');
	poll.find({_id: 1},function(err,foundData){
		
			res.render('admin-poll',{Pollres: foundData[0]});
		
			// res.render('/admin-poll');

		// if(err){
		// 	res.send("<h1><strong>Eroor!!!</strong></h1>");
		// }
	});
});

app.delete('/ad-poll-delete',(req,res)=>{

	poll.deleteOne({_id: 1},function(err,foundData){
		if(err) throw err;

		console.log('deleted');
		res.redirect('/admin-poll');
	});
});

//payment status
app.get('/update-fee',(req,res)=>{

	res.render('update-fee');
});

app.post('/create-fee-table',urlencodedParser,(req,res)=>{
	var fee_posts = {stID: req.body.st_id, HostelFee: req.body.fee_hostel, MessFee: req.body.fee_mess,Fine: req.body.fine};
		connection.query('insert into PaymentDetails set ?',fee_posts,function(error,results,fields){
			if(error) throw error;
			console.log(results);

		});
		res.redirect('/update-fee');
});

app.post('/update-fee-table',urlencodedParser,(req,res)=>{

	console.log(req.body.st_id1);
	
	var posts = [req.body.fee_hostel1,req.body.fee_mess1,req.body.fine1,req.body.st_id1];
	connection.query('UPDATE PaymentDetails SET HostelFee = ? , MessFee = ? , Fine = ? WHERE stId = ?' ,posts,function(error,results,fields){
		if(error) throw error;

		console.log(results);
	});

	res.redirect('/update-fee');
});

//Check Payment Details
app.get('/payment-board',(req,res)=>{
	res.render('student-payment-query');
});

app.post('/st-id-payment',urlencodedParser,(req,res)=>{
	
	console.log(req.body);
	req.flash('st-id',req.body.st_id);
	res.redirect('/check-payment-details');
});


app.get('/check-payment-details',(req,res)=>{

	var id = req.flash('st-id');
	var q_data = `select * from PaymentDetails where stID="${id}" `;
	connection.query(q_data, function(error,results,fields){
		if(error) throw error;

		res.render('student-payment',{hostel_fee: results[0].HostelFee , mess_fee: results[0].MessFee , hostel_fine: results[0].Fine});
	});
});

//Hostel Presence

app.post('/hostel-presence',urlencodedParser,(req,res)=>{

	// var pID = req.flash('presence-id');
	// console.log(pID);
	var pPost = {PID: req.body.presence_usn , presence: parseInt(req.body.isPresent) };

	connection.query('insert into HostelPresence set ?',pPost,function(error,results,fields){
			if(error) throw error;
			console.log(results);

	});
	res.redirect('/st-dashboard');

});

app.get('/student-present',(req,res)=>{

	connection.query('select SUM(2) as sum from HostelPresence',function(error,results,fields){
			if(error) throw error;
			res.render('st_present',{st_num: results[0].sum*0.5});

	});
	

});

//feedback

app.post('/feedback',urlencodedParser,(req,res)=>{

	console.log(req.body.w3review);

	var Student_Feedback = new feedback({

		St_feedback: req.body.w3review
	});

	Student_Feedback.save(function(error){
		console.log("feedback saved");
		res.redirect('/st-dashboard');
	if (error){
		console.error(error);
		}
	});
});

app.get('/admin-feedback',(req,res)=>{

	feedback.find({},function(err,foundData){
		// console.log(foundData[0].St_feedback);

		res.render('student-feedback',{st_fb: foundData});
		if(err){
			console.log(err);

		}
	});
});

app.post('/ad-poll',urlencodedParser,(req,res)=>{
	// console.log(req.body);

	var adminPoll = new poll({
		_id : 1 , 
		title: req.body.ptitle ,
		ques : req.body.pques ,
		option1: req.body.po1 ,
		option2: req.body.po2 ,
		option3: req.body.po3 ,
		option4: req.body.po4 ,
		ansop1 : 0 ,
		ansop2 : 0 ,
		ansop3 : 0 ,
		ansop4 : 0
	});
	adminPoll.save(function(error){
		console.log("Poll saved");
		res.redirect('/admin-poll');
	if (error){
		console.error(error);
		}
	});
});

app.get('/poll-board',(req,res)=>{

	poll.find({_id: 1},function(err,foundData){
		// console.log(foundData[0].ques);
		console.log()
		res.render('student-poll',{stPoll:foundData[0]});
		if(err){
			res.send("<h1><strong> Poll Not Found </strong></h1>")
		}
	});
	
});

app.post('/st-poll',urlencodedParser,(req,res)=>{
	if(req.body.op == 1)
	{
		poll.updateOne({_id:1},{$inc:{ansop1: 1}},function(err,numAffected){
			console.log(numAffected);
		});
	}
	else if(req.body.op == 2)
	{
		poll.updateOne({_id:1},{$inc:{ansop2: 1}},function(err,numAffected){
			console.log(numAffected);
		});
	}
	else if(req.body.op == 3)
	{
		poll.updateOne({_id:1},{$inc:{ansop3: 1}},function(err,numAffected){
			console.log(numAffected);
		});
	}
	else 
	{
		poll.updateOne({_id:1},{$inc:{ansop4: 1}},function(err,numAffected){
			console.log(numAffected);
		});
	}
	res.redirect('poll-board');
});

//Student Mess Form

app.get('/st-mess',(req,res)=>{

	res.render('student-mess-form');

});

app.post('/mess_form_post',urlencodedParser,(req,res)=>{

	console.log(req.body);
	var mess_posts = {usn: req.body.mf_usn , roomNo: req.body.mf_room , feeDate: req.body.mf_date};
	connection.query('insert into MessForm set ?',mess_posts,function(error,results,fields){
		if(error) throw error;
		console.log(results);
	});
	res.redirect('/st-mess');

});

app.get('/ad-mess-form',(req,res)=>{	
	res.render('AdMessForm');
});

app.post('/postMessForm',urlencodedParser,(req,res)=>{

	var results = req.body.amf_usn;
	// console.log(results);
	req.flash('amf_usn',results);
	res.redirect('/ad-mess-form2');
});

app.get('/ad-mess-form2',(req,res)=>{

	var results = req.flash('amf_usn');
	if(results.length > 0)
	{
		var q_data = `select * from MessForm where usn="${results[0]}" `;
		connection.query(q_data, function(error,results,fields){
			if(error) throw error;

			 res.render('AdMessForm2', {usn: results[0].usn , roomNo: results[0].roomNo , feeDate: results[0].feeDate});
			 console.log(results[0].usn);
		});
	}

});

//Room vacancy
app.get('/ad-hostel-rooms',(req,res)=>{

	res.render('adRooms')
});

app.post('/postRoom',urlencodedParser,(req,res)=>{

	req.flash('adr_room',req.body.adr_room);
	res.redirect('/ad-hostel-rooms2');
});

app.get('/ad-hostel-rooms2',(req,res)=>{

	var id = req.flash('adr_room');
	var q_data = `select * from Rooms where roomNo="${id}" `;
	connection.query(q_data, function(error,results,fields){
		if(error){
			res.send("<center><h1>Room Not Allocated Yet</h1></center> ");
		}
		else
		 	res.render('AdRooms2', {usn: results[0].allocated_usn , roomno: results[0].roomNo , vacancy: results[0].vacancy});
		//  console.log(results);

	});
	
});

//Payment Receit

app.get('/payment-receit',(req,res)=>{

	res.render('st_pay_receit');
});

app.post('/payment-receit-post', upload, (req, res, next) => {
 
    // var obj = {
    //     usn: req.body.img_usn,
	// 	img: req.body.image
	// 	// {
    //     //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
    //     //     contentType: 'image/png'
    //     // }
	// }
	var imageUpload = new imgModel({
		usn: req.body.img_usn ,
		img: req.file.filename
	});

	imageUpload.save(function(err, doc){
		if(err) throw err;

		console.log(doc);
	})
    // imgModel.create(obj, (err, item) => {
    //     if (err) {
    //         console.log(err);
    //     }
    //     else {
    //         // item.save();
    //         res.redirect('/ad-pay-receit');
    //     }
	// });
	res.redirect('/payment-receit');
});

app.get('/ad-receit',(req,res)=>{

	res.render('adpayreceit');
});

app.post('/ad-receit-post',urlencodedParser,(req,res)=>{
	req.flash('usnId',req.body.adimg_usn);
	res.redirect('/ad-pay-receit');
});

app.get('/ad-pay-receit',(req,res)=>{

	var id = req.flash('usnId');
	console.log(id[0]);
	imgModel.find({usn: id[0].toString()}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
			res.render('adPayReceit', { items: items });
			console.log(items);	
        }
    });
});

app.listen(8080,()=>{
	console.log("Listening at port 8080.");
});