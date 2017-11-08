module.exports = function(app, express, passport) {

	var multer  = require('multer');
	var storage = multer.diskStorage({
 	destination: function (req, file, cb) {
 		console.log("image",req.body)
    cb(null, './public/assets/upload/profileImg/')
    },
  	filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname.substr(file.originalname.lastIndexOf("."),file.originalname.length) )
    
   }
})
	var upload = multer({ storage: storage })

	var router = express.Router();



	var userLogin = require('./../app/controllers/users/users.js');
    var fs = require('fs');

	var storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, './public/assets/csv');
		},
		filename: function (req, file, cb) {
			//var filnameArr = file.originalname.split('.');
			var fileNameArr=file.originalname.substr(file.originalname.lastIndexOf('.')+1);
			cb(null, file.fieldname + '_' + Date.now() + '.' + fileNameArr);
		}
	});

	var uploadCsv = multer({
	    rename: function (fieldname, filename) {
	        return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
	    }, storage: storage
	});
	
	router.post('/authenticate', passport.authenticate('users', {session:false}), userLogin.authenticate);
	router.post('/forgot_password', userLogin.forgot_password);
	router.post('/resetPassword', userLogin.resetPassword);
	router.post('/userList', userLogin.userList);
	router.post('/faceBookLogin',userLogin.faceBookLogin);
	router.post('/updateUserInformation',userLogin.updateUserInformation);

	router.post('/updateImage',upload.any(),userLogin.updateImage);
	router.post('/unSubscribe',userLogin.unSubscribe);
	router.post('/registration' ,userLogin.registration);
	router.post('/checkotp' ,upload.any(), userLogin.checkOtp);
	router.post('/getCurrentUserData',passport.authenticate('bearer', {session:true}), userLogin.getCurrentUserData);
    router.post('/viewProfile', userLogin.viewProfile);
	router.post('/logout', userLogin.logout);
	router.post('/removeUser', userLogin.removeUser);
	router.post('/blockUser', userLogin.blockUser);
	router.post('/unblockUser', userLogin.unblockUser);
	router.get('/malefemalemonthly',userLogin.usersmontly);
	// router.get('/userinfeb',userLogin.userinfeb);
	// router.get('/userinmarch',userLogin.userinmarch);
	// router.get('/userinapril',userLogin.userinapril);
	// router.get('/userinmay',userLogin.userinmay);
	// router.get('/userinjune',userLogin.userinjune);
	// router.get('/userinjuly',userLogin.userinjuly);
	// router.get('/userinaug',userLogin.userinaug);
	// router.get('/userinsept',userLogin.userinsept);
	// router.get('/userinoct',userLogin.userinoct);
	// router.get('/userinnov',userLogin.userinnov);
	// router.get('/userindec',userLogin.userindec);


	
	//router.post('/logOut',userLogin.logOut);
	router.post('/deleteUser',passport.authenticate('bearer', {session:true}),userLogin.deleteUser);
	router.get('/cred',userLogin.cred);
	router.post('/list', userLogin.userList);
	router.get('/latestUser', passport.authenticate('bearer', {session:true}), userLogin.latestUser);
	router.get('/totalUser', passport.authenticate('bearer', {session:true}), userLogin.totalUser);
	router.post('/add', passport.authenticate('bearer', {session:false}),userLogin.add);
	router.param('id', userLogin.user);
	router.post('/update/:id', userLogin.update);
	router.get('/userOne/:id',  [passport.authenticate('bearer', {session:true})], userLogin.findOne);
	router.get('/findOne/:id',  [passport.authenticate('bearer', {session:true})], userLogin.getOne);
	router.get('/userSkills/:id',  [passport.authenticate('bearer', {session:true})], userLogin.userSkills);	
	router.post('/bulkUpdate',  [passport.authenticate('bearer', {session:true})], userLogin.bulkUpdate);
	router.post('/approve',  [passport.authenticate('bearer', {session:true})], userLogin.approve);
	router.post('/changePassword', userLogin.changePassword);
	router.post('/adminChangePassword', userLogin.adminChangePassword);
	router.post('/likesleft', userLogin.likesleft);
	router.post('/addlikes', userLogin.addlikes);
	router.post('/usermatchlist', userLogin.usermatchlist);
	
	router.post('/updateUserdata', [passport.authenticate('bearer', {session:true})], userLogin.updateUserdata);
	//router.post('/addRating', userLogin.addRating);
	//router.get('/userJobsCount/:userId', [passport.authenticate('bearer', {session:true})],  userLogin.userJobsCount);	
	app.use('/user', router);

}
