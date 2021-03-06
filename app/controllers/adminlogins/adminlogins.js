var adminLoginObj = require('./../../models/adminlogins/adminlogin.js');
var userObj = require('./../../models/users/users.js');
var constantObj = require('./../../../constants.js');
var chsimpconstantObj = require('./../../../chsimpconstants.js');
var chtradconstantObj = require('./../../../chtradconstants.js');
var nodemailer = require('nodemailer');
var qs = require('querystring');
var request = require('request');
var jwt = require('jwt-simple');
var moment = require('moment');
var crypto = require('crypto');
var formidable = require('formidable');
var http = require('http');
var url = require('url') ;
var fs = require('fs');
var path = require('path');
var emailService = require('./../email/emailService.js');
var userTokenObj = require('./../../models/users/userTokens.js');
var commonjs = require('./../commonFunction/common.js');
//authenticate
exports.authenticate = function(req, res) {
	//console.log(res.req.user);
	
	res.jsonp({'status':'success', 'messageId':200, 'message':'User logged in successfully','displayName':res.req.user.firstname+" "+res.req.user.lastname,'access_token':res.req.user.token,image:res.req.user.image});
}
//logout
exports.logout = function(req, res) {
	if(req.body.access_token){
		userTokenObj.remove({token:req.body.access_token},function(err,result){
			if(err){
				outputJSON = {'status':'failure', 'messageId':203, 'message': errorRetreivingData};
		
			}else{
				outputJSON = {'status':'success', 'messageId':200, 'message': "logout susseccfuly user or admin Id "+req.body.loginId}
			
			}
			res.jsonp(outputJSON);
		})
	}
	
	}

exports.forgotPassword = function(req, res) {

	 if(req.body.username){
            var details = req.body.username;
    var detailsdata = {};


    adminLoginObj.findOne({
        email: details
    }, function(err, data) {
        console.log("inside findOne", JSON.stringify(data))
        if (data == null) {
            var response = {
                "status": 'faliure',
                "messageId": 401,
                "message": "Email does not exist."
            };
            res.status(401).json(response);
        } else {

            var email_encrypt = commonjs.encrypt(data.email);
            var generatedText = commonjs.makeid();


            if (email_encrypt && generatedText) {
                detailsdata.email = data.email;
                detailsdata.password = generatedText;
                console.log(detailsdata)
                adminLoginObj.update(detailsdata.email, detailsdata, function(errr, datar) {

                    if (errr) {
                        response = {
                            "status": 'success',
                            "messageId": 200,
                            "message": "Error while updating.",
                            "error": errr
                        };
                        res.status(200).json(response);
                    } else {
                    	console.log("datar",datar)
                        var resetUrl = "http://" + req.headers.host + "/#/" + "admin/" + email_encrypt + "/" + generatedText;
                        console.log(resetUrl)

                        var transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'osgroup.sdei@gmail.com',
                                pass: 'mohali2378'
                            }
                        });
                        var message = '<html><body style="background-color: #f2f2f2"><div style="width:90%; padding: 15px; background-color: #fff; box-shadow: 3px 3px #dddddd;"><div style="padding-top:10px; background-color: #f0f0f0; height: 100px"><img src="http://' + req.headers.host + '/images/logo2.png" height="60px" style="padding: 15px"></div><div style="padding-top:10px">Hi,</div><div style="padding-top:30px">Your email has been used in a password reset request at FlirtMe APP.</div><div style="padding-top:20px">If you did not initiate this request, then ignore this message.</div><div style="padding-top:20px">Copy the link below into your browser to reset your password.</div><div style="padding-top:30px"><a href="' + resetUrl + '">Reset Password</a></div><div style="padding-top:50px">Regards,<br>FirtMe</div></div></body></html>'

                        transporter.sendMail({
                            from: 'osgroup.sdei@gmail.com',
                            //to: 'hshussain86',
                            to: details,
                            //cc: 'vpdev@smartdatainc.net',
                            //bcc:'hshussain86@hotmail.com',
                            subject: 'Password for FlirtMe App',
                            html: message
                        });

              
                        res.status(200).send({
                            'resetUrl': resetUrl,
                            "status": 'success',
							"messageId": 200,
							"message": "Mail sent successfully."
                        });
                    }
                });
            }
        }
    })
    }
    else{
      response = {
                            "status": 'failure',
                            "messageId": 401,
                            "message": "Pass required fields."
                        };
                        res.status(401).json(response);  
    }
}




exports.resetPassword = function(req, res) {

					console.log("reset ",req.body);
					var key = 'MySecretKey12345';
			        var iv = '1234567890123456';
			        var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
			        var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
			       	var encrypted = cipher.update(req.body.newpwd, 'utf8', 'binary');
			        encrypted += cipher.final('binary');
			        hexVal = new Buffer(encrypted, 'binary');
			        newEncrypted = hexVal.toString('hex');
			        console.log("decipherPassword ",newEncrypted);

			        console.log(commonjs.decrypt(req.body.email))
		
	adminLoginObj.update({ email:commonjs.decrypt(req.body.email) },{$set:{password:newEncrypted,verifyStr:""}}, function(err, data) {

		if(err) {

			outputJSON = {'status':'failure', 'messageId':203, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.errorTryAgain : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.errorTryAgain : constantObj.messages.errorSendingForgotPasswordEmail)};
		}
		else {
					if(data.nModified>0){

					outputJSON = {'status':'success', 'messageId':200, 'message': 'Password has been chaged successfully'}
			
					}else{
						outputJSON = {'status':'failure', 'messageId':203, 'message': 'You have already changed your password.'};
		
					}
				

		}


		res.jsonp(outputJSON);

	});
}
/**
		 * Find jobtype by id
		 * Input: jobtypeId
		 * Output: Jobtype json object
		 * This function gets called automatically whenever we have a jobtypeId parameter in route. 
		 * It uses load function which has been define in role model after that passes control to next calling function.
		 */
		 exports.admin = function(req, res, next, id) {
		 	
		 	adminLoginObj.load(id, function(err, admin) {
		 		console.log(admin);
		 		if (err){
		 			res.jsonp(err);
		 		}
		 		else if (!admin){
		 			res.jsonp({err:'Failed to load admin ' + id});
		 		}
		 		else{
		 			req.admin = admin;
		 			next();
		 		}
		 	});
		 };
/**
		 * Show admin by id
		 * Input: admin json object
		 * Output: admin json object
		 * This function gets role json object from exports.role 
		 */
		 exports.findOne = function(req, res) {
		 	console.log(req.admin);
		 	if(!req.admin) {
		 		outputJSON = {'status':'failure', 'messageId':203, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)};
		 	}
		 	else {
		 		outputJSON = {'status':'success', 'messageId':200, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.successRetreivingData : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.successRetreivingData : constantObj.messages.successRetreivingData), 
		 		'data': req.admin}
		 	}
		 	res.jsonp(outputJSON);
		 };

//change password
exports.changePassword = function(req, res) {

	var outputJSON = "";

	adminLoginObj.findOne({username:req.body.username}, function(err, data) {

		if(err) {
			outputJSON = {'status':'failure', 'messageId':203, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)};
			res.jsonp(outputJSON);
		}
		else {
				//console.log(data)
					var key = 'MySecretKey12345';
			        var iv = '1234567890123456';
			        var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
			        var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
			       	var encrypted = cipher.update(req.body.oldpassword, 'utf8', 'binary');
			        encrypted += cipher.final('binary');
			        hexVal = new Buffer(encrypted, 'binary');
			        newEncrypted = hexVal.toString('hex');
			        console.log("decipherPassword ",newEncrypted);
			        oldpassword=newEncrypted;

			if(data && data.password==oldpassword) {
					//console.log(data)
					var key = 'MySecretKey12345';
			        var iv = '1234567890123456';
			        var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
			        var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
			       	var encrypted = cipher.update(req.body.password, 'utf8', 'binary');
			        encrypted += cipher.final('binary');
			        hexVal = new Buffer(encrypted, 'binary');
			        newEncrypted = hexVal.toString('hex');
			        console.log("decipherPassword ",newEncrypted);
			        password=newEncrypted;
				adminLoginObj.update({username:req.body.username},{$set:{password:password}},function(err,response){
					if(err) {
							outputJSON = {'status':'failure', 'messageId':203, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)};
							res.jsonp(outputJSON);
						}else{
						outputJSON = {'status':'success', 'messageId':200, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.phoneSuccess : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.phoneSuccess : constantObj.messages.successSendingChangePassword)};
						res.jsonp(outputJSON);
						}
					});

			}else{
				outputJSON = {'status':'failure', 'messageId':203, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)};
							res.jsonp(outputJSON);
			}
			

		}

		

	});
}


//change password
exports.saveProfile = function(req, res) {

	var outputJSON = "";
	console.log(req.body);
	adminLoginObj.findOne({username:req.body.preusername}, function(err, data) {

		if(err) {
			outputJSON = {'status':'failure', 'messageId':203, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)};
			res.jsonp(outputJSON);
		}
		else {
			
			if(data) {
				
				adminLoginObj.update({username:req.body.preusername},{$set:{firstname:req.body.firstname,lastname:req.body.lastname,email:req.body.email}},function(err,response){
					if(err) {
							outputJSON = {'status':'failure', 'messageId':203, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)};
							res.jsonp(outputJSON);
						}else{
						outputJSON = {'status':'success', 'messageId':200, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.phoneSuccess : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.phoneSuccess : constantObj.messages.successSendingChangePassword)};
						res.jsonp(outputJSON);
						}
					});

			}
			

		}

		

	});
}
//Commission Setting
exports.commissionSetting = function(req, res) {

	var outputJSON = "";
	console.log(req.body);
	
				adminLoginObj.update({$set:{admin_commission:req.body.admin_commission,stripe_credential:req.body.stripe_credential}},function(err,response){
					if(err) {
							outputJSON = {'status':'failure', 'messageId':203, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)};
							res.jsonp(outputJSON);
						}else{
						outputJSON = {'status':'success', 'messageId':200, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.phoneSuccess : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.phoneSuccess : constantObj.messages.successSendingChangePassword)};
						res.jsonp(outputJSON);
						}
					});
			
}




//Get Commission Setting
exports.getCommission= function(req, res) {

	var outputJSON = "";
	
				adminLoginObj.find({},function(err,response){
					if(err) {
							outputJSON = {'status':'failure', 'messageId':203, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)};
							res.jsonp(outputJSON);
						}else{
							//console.log(response)
						outputJSON = {'status':'success', 'messageId':200, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.successRetreivingData : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.successRetreivingData : constantObj.messages.successRetreivingData),data:response[0].admin_commission};
						res.jsonp(outputJSON);
						}
					});

			
}
//Profile image upload
exports.uploadProImg= function(req, res){
					var outputJSON = "";
					
					console.log("hererrer");
				      var photoname = req.body.username+'_'+Date.now() + '.png';
				      var imagename = __dirname+"/../../../public/assets/upload/adminProfile/"+photoname;
				      if(req.body.prof_image.indexOf("base64,")!=-1){	
				     var Data = req.body.prof_image.split('base64,');
				     var base64Data = Data[1];
				    // console.log(base64Data); 
				      fs.writeFile(imagename, base64Data, 'base64', function(err) {
				      if (err) {
				        console.log(err);
				        outputJSON = {'status':'failure', 'messageId':203, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)};
						res.jsonp(outputJSON);


				      }
				        else{
				        	
						
					adminLoginObj.update({'username':req.body.username},{$set: {'prof_image':photoname}},function(err,response){
						console.log(response);
						outputJSON = {'status':'success', 'messageId':200, 'message':'Image upload successfully.','image': photoname};
						res.jsonp(outputJSON);
						});
				        
				        
				        }
				      });
				  }else{
				  	outputJSON = {'status':'failure', 'messageId':203, 'message': req.headers.lang=="chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang=="chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)};
					res.jsonp(outputJSON);
				  }
			}


