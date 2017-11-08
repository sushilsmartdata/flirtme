var userObj = require('./../../models/users/users.js');
var messageObj = require('./../../models/messages/messages.js');
var tmpObj = require('./../../models/tempotp/tempotps.js');
var adminLoginObj = require('../../models/users/users.js');
var settingObj = require('./../../models/setting/setting.js');
var tokenService = require('../../token/tokenAuth.js');
var appUserTokenObj = require('../../models/users/appUserTokens.js');
var matchListObj = require('./../../models/matchList/matchList.js');
var userTokenObj = require('../../models/users/userTokens.js');
var mongoose = require('mongoose');
var constantObj = require('./../../../constants.js');
var likeDislikeObj = require('./../../models/likeAndDislike/likeAndDislike.js');
// var nodeUnique = require('node-unique-array')
var chsimpconstantObj = require('./../../../chsimpconstants.js');
var chtradconstantObj = require('./../../../chtradconstants.js');
var nodemailer = require('nodemailer');
var fs = require('fs');
var md5 = require('md5');
var emailService = require('./../email/emailService.js');
var crypto = require('crypto');
var key = 'MySecretKey12345';
var iv = '1234567890123456';
var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
var Jimp = require("jimp");
var geocoder = require('geocoder');
var commonjs = require('./../commonFunction/common.js');
var emailTemplate = require('./../../models/helpBlock/cms.js');
var smtpTransport = require('nodemailer-smtp-transport');
var gcm = require('android-gcm');
logger = require('./../../../log');
var dateFormat = require('dateformat');
var apns = require('apn');
var path = require('path');
var moment = require('moment');
var ffmpeg = require('ffmpeg');
var videoScreen = require('video-screen');
var getDuration = require('get-video-duration');
var getDimensions = require('get-video-dimensions');
var errorCallback = function(err, notif) {
	console.log('ERROR : ' + err + '\nNOTIFICATION : ' + notif);
}
var accountSid = 'AC426b62d1b7112129291e5b06f04a168a';
var authToken = 'fff6f09449615aaa07a55ca819586f93';
//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);
var geodist = require('geodist');
var unique = require('array-unique');
// var sortBy = require('sort-by');



//authenticate
exports.authenticate = function(req, res) {
	console.log("Request", req.headers.device_token)
	if (res.req.user.error == true) {

		res.jsonp({
			'status': 'failure',
			'messageId': 203,
			'message': 'Incorrect Phone number or Password'
		});


	} else {
		if (req.headers.device_token != "" && req.headers.device_token != undefined) {
			userObj.update({
				_id: res.req.user.id
			}, {
				$set: {
					device_token: req.headers.device_token
				}
			}, function(err, updRes) {
				if (err) {
					console.log(err);
				} else {
					console.log("device id updated", updRes);
				}

			})
			userObj.find({
					_id: res.req.user.id
				})
				.exec(function(err, data) {
					if (err) {
						outputJSON = {
							'status': 'failure',
							'messageId': 203,
							'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
						};
					}
					console.log(data[0]);
					res.jsonp({
						'status': 'success',
						'messageId': 200,
						'message': 'User logged in successfully',
						'data': data[0],
						//'sessionID': data[0]._id,
						'access_token': res.req.user.token
					});


				});
		} else {
			res.jsonp({
				'status': 'failure',
				'messageId': 401,
				'message': 'Token not found',

			});

		}

	}
}



exports.registration = function(req, res) {
	//console.log(req.body)
	var errorMessage = '';
	var messages = ''
	if (req.body.phone !== "" && req.body.phone != undefined) {
		userObj.findOne({
			phone: req.body.phone
				//status:true
		}, function(err, data) {
			if (err) {
				outputJSON = {
					'status': 'failure',
					'messageId': 401,
					'message': 'Error in finding email' + err
				};
				res.jsonp(outputJSON);
			} else {
				//
				console.log("data", data);
				// if data not equal to null means this user is already registered
				if (data == null) {
					if (req.body.zipCode != undefined) {
						/*
						GeoCode is a function is used to retrieve latitude and longitude from zipCode
						required parameters are zipCode	
						*/
						geocoder.geocode(req.body.zipCode, function(err, data) {
							if (err) {
								// return 0;
								console.log('geolocation error : ' + err);
							} else {
								if (data.status == 'OK') {
									var result = {};
									result.lat = data.results[0].geometry.location.lat;
									result.lng = data.results[0].geometry.location.lng;
									console.log("resutl is", result);
									signUpProcess(req, res, result);
								} else {
									signUpProcess(req, res, result);
								}
							}
						})

					} else {
						signUpProcess(req, res);
					}
				} else {
					outputJSON = {
						'status': 'failure',
						'messageId': 401,
						'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.phoneExist : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.phoneExist : constantObj.messages.phoneExist)
					};
					res.status(200).jsonp(outputJSON);
				}
			}
		})
	} else {
		signUpProcess(req, res);
	}


}


exports.checkOtp = function(req, res) {
	if (req.headers.lat == '' && req.headers.lng == '') {
		req.headers.lat = "0";
		req.headers.lng = "0";
	}

	var errorMessage = '';
	var messages = '';
	if (req.body.type == 1) {
		userObj.findOne({
			otp: req.body.otp,
			phone: req.body.phone
		}, function(err, data) {
			if (err) {
				outputJSON = {
					'status': 'failure',
					'messageId': 401,
					'message': 'Error in finding email' + errorMessage
				};
				res.jsonp(outputJSON);
			} else {
				console.log("data", data)
				if (data != null) {
					req.checkOtp = true;
					login(req, res, data);
				} else {
					outputJSON = {
						'status': 'failure',
						'messageId': 401,
						'message': 'Invalid Phone number or OTP'
					};
					res.jsonp(outputJSON);
				}

			}
		})
	} else {
		//console.log("session",req.session.otp)
		console.log('Cookies: ', req.cookies);
		console.log("asdasd", req.body)
		tmpObj.find({
			otp: req.body.otp,
			phone: req.body.phone

		}).exec(function(err, data) {
			if (err) {
				res.send({
					"status": 'failure',
					"messageId": 401,
					'message': err
				});
			} else {

				console.log(data)

				if (data.length > 0) {

					if (data[0].otp == req.body.otp) {
						var pswd = req.body.password
						var saveData = JSON.parse(JSON.stringify(req.body));
						console.log("saveData before", req.body);
						var pswdd = JSON.parse(JSON.stringify(req.body.password));
						saveData.password = md5(pswdd);


						if (req.body.zipCode != undefined && req.body.WebRequest == "WebRequest") {

							saveData.latLong = [userdata.lng, userdata.lat];

						}

						if (req.headers.lng) {
							saveData.latLong = [req.headers.lng, req.headers.lat];
						}

						if (req.body.dob) {
							saveData.dob = new Date(req.body.dob);
						} else {
							saveData.dob = moment().subtract(18, "years").format("YYYY-MM-DD");
						}
						// saveData.lng = userdata.lng;

						console.log("req.files", req.files);

						var userimg = [];
						var obj = {};


						if ((req.files) && (req.files.length > 0)) {
							saveData.userImages = [{
								name: req.files[0].filename
							}];
							// console.log(saveData.profile_image);
						} else {
							// saveData.profile_image = "";
						}
						if (saveData.phone != "" && saveData.phone != undefined) {
							userObj(saveData).save(saveData, function(err, data) {
								if (err) {
									console.log("dasdsa", err.errors);
									if (err) {
										outputJSON = {
											'status': 'failure',
											'messageId': 401,
											'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.phoneEmail : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.phoneEmail : constantObj.messages.emailExist)
										};
									} else {
										outputJSON = {
											'status': 'failure',
											'messageId': 401,
											'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorInput : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorInput : constantObj.messages.errorInput)

										};
									}
									res.status(200).jsonp(outputJSON)
								} else {
									saveSetting(data);
									login(req, res, data);
								}
							})
						} else {
							res.send({
								"status": 'success',
								"messageId": 200,
								'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.validInformation : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.validInformation : constantObj.messages.validEmail)
							});
						}

					}

				} else {

					res.send({
						"status": 'failure',
						"messageId": 203,
						'message': "OTP does not match"
					});
				}


			}

		});

	}

}



var signUpProcess = function(req, res, userdata = undefined) {

	if (req.body.zipCode == undefined && req.body.WebRequest == "WebRequest") {
		outputJSON = {
			'status': 'failure',
			'messageId': 401,
			'message': "zipcode is not valid"
		};
		res.status(200).jsonp(outputJSON);
	} else {
		var text = generateOtp();

		//saveData.otp=text;
		client.messages.create({
			from: "+14159149032",
			to: req.body.phone,
			body: text
		}, function(err, message) {
			if (err) {
				console.error(err.message);
			} else {
				console.log(message);

				tmpObj.find({
					phone: req.body.phone
				}).exec(function(err, data) {
					if (err) {
						res.send({
							"status": 'failure',
							"messageId": 401,
							'message': err
						});
					} else {

						console.log("Outdata", data)
						if (data.length > 0) {

							tmpObj.update({
								phone: req.body.phone
							}, {
								$set: {
									otp: text
								}
							}).exec(function(err, data) {
								if (err) {
									console.log(err)
								} else {
									console.log("update")
								}
							})


						} else {

							tmpObj({
								"otp": text,
								"phone": req.body.phone
							}).save({
								"otp": text
							}, function(err, s) {

								if (err) {
									console.log(err)
								} else {
									console.log("savewvd")
								}

							});

						}
					}
				});
			}
		});

		res.jsonp({
			'status': 'success',
			'messageId': 200,
			'message': 'OTP has been sent successfully'
		});
	}
}


var login = function(req, res, data) {
	console.log("data input in login", data);
	var username = data.phone;
	var password = data.password;


	console.log("req.body in login", req.body);
	if (req.body.faceBookFlag) {
		console.log("logged in via facebook ")
		adminLoginObj.findOne({
			facebook_id: data.facebook_id
		}).exec(function(err, adminuser) {
			if (err) {
				return done(err);
			} else {
				userObj.update({
					_id: adminuser._id
				}, {
					$set: {
						device_type: req.headers.device_type
					}
				}, function(err, result) {
					if (err) {
						console.log("err", err)
					} else {
						console.log("hgvhgv,result", result)
					}
				})

				userObj.find({
					_id: adminuser._id

				}).exec(function(err, data) {
					if (err) {
						outputJSON = {
							'status': 'failure',
							'messageId': 203,
							'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
						};
					}
					console.log(data);
					var authToken = tokenService.issueToken({
						sid: adminuser
					});
					// save token to db  ; 
					var tokenObj = new appUserTokenObj({
						"user": adminuser._id,
						"token": authToken
					});
					tokenObj.save(function(e, s) {});
					// req.session._id=data[0]._id;
					// req.session.email=data[0].email;
					// req.session.loggedInUsername=data[0].display_name;
					dataRepsonse = data[0];
					if (req.checkOtp == true) {

					}
					tmpObj({
						"phone": req.body.phone
					}).remove({
						"phone": req.body.phon
					}, function(err, s) {

						if (err) {
							console.log(err)
						} else {
							console.log("removed")
						}

					});
					res.jsonp({
						'status': 'success',
						'messageId': 200,
						'message': 'User logged in successfully',
						'data': data[0],
						'access_token': authToken
					});


				});

			};
		})

	} else {
		console.log("logged in via email and password", username)


		adminLoginObj.findOne({
			phone: username
		}, function(err, adminuser) {
			if (err) {
				return done(err);
			} else {
				//returning specific data


				userObj.find({
						_id: adminuser._id

					})
					.exec(function(err, data) {


						if (err) {
							outputJSON = {
								'status': 'failure',
								'messageId': 203,
								'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
							};
						}
						console.log(data);
						var authToken = tokenService.issueToken({
							sid: adminuser
						});
						// save token to db  ; 
						var tokenObj = new appUserTokenObj({
							"user": adminuser._id,
							"token": authToken
						});
						tokenObj.save(function(e, s) {});
						// req.session._id=data[0]._id;
						// req.session.email=data[0].email;
						// req.session.loggedInUsername=data[0].display_name;


						console.log("checklDAa", req.body.phone)

						tmpObj.remove({
							"phone": req.body.phone
						}, function(err, s) {

							if (err) {
								console.log(err)
							} else {
								console.log("removed")
							}

						});
						if (req.checkOtp == true) {
							res.jsonp({
								'status': 'success',
								'messageId': 200,
								'message': 'User logged in successfully'
							});

						} else {
							res.jsonp({
								'status': 'success',
								'messageId': 200,
								'message': 'User logged in successfully',
								'data': data[0],
								'access_token': authToken
							});

						}

					});

			};
		})
	}

}


exports.forgot_password = function(req, res) {
	userObj.findOne({
			phone: req.body.phone
		})
		.exec(function(err, data) {
			if (err) {
				console.log(err);
				outputJSON = {
					'status': 'failure',
					'messageId': 203,
					'message': ''

				};
				res.status(200).jsonp(outputJSON);
			} else {
				if (data != null) {
					var text = generateOtp();
					client.messages.create({
						from: "+14159149032",
						to: req.body.phone,
						body: text
					}, function(err, message) {
						if (err) {
							res.jsonp({
								'status': 'success',
								'messageId': 401,
								'message': err,

							});
						} else {
							adminLoginObj.update({
								phone: req.body.phone
							}, {
								$set: {
									otp: text
								}
							}).exec(function(err, data) {
								if (err) {
									console.log(err)
								} else {
									res.jsonp({
										'status': 'success',
										'messageId': 200,
										'message': 'OTP has been sent successfully',
									});
								}
							})
						}
					});
				} else {
					res.jsonp({
						'status': 'error',
						'messageId': 401,
						'message': "Phone number doesn't exist",

					});
				}
			}
		})

}

exports.faceBookLogin = function(req, res) {
	console.log("in faceBookLogin");
	var errorMessage = '';
	var messages = '';
	console.log(req.headers);

	if (req.headers.lat == '' && req.headers.lng == '') {
		req.headers.lat = "0";
		req.headers.lng = "0";
	}
	req.body.faceBookFlag = true;
	if (req.body.facebook_id) {
		adminLoginObj.findOne({
			facebook_id: req.body.facebook_id
		}, function(err, data1) {
			if (err) {
				outputJSON = {
					'status': 'failure',
					'messageId': 401,
					'message': 'Error' + errorMessage
				};
				res.status(200).jsonp(outputJSON);
			} else {
				console.log("data1", data1);
				if (data1 == null) {
					console.log(req.body);
					var saveData = req.body;
					saveData.latLong = [req.headers.lng, req.headers.lat]
					adminLoginObj(saveData).save(saveData, function(err, data) {
						if (err) {
							console.log("err.code", err);
							if (err.code == 11000) {
								outputJSON = {
									'status': 'failure',
									'messageId': 401,
									'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.phoneExist : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.phoneExist : constantObj.messages.phoneExist)
								};
							} else if (err.errors.email) {
								outputJSON = {
									'status': 'failure',
									'messageId': 401,
									'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.validInformation : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.validInformation : constantObj.messages.validEmail)
								};
							}
							res.status(200).jsonp(outputJSON)
						} else {
							saveSetting(data);
							login(req, res, data);
						}
					})

				} else {
					console.log("here in ", data1);
					login(req, res, data1);
				}
			}
		})
	} else {
		var response = {
			"status": 'failure',
			"messageId": 401,
			'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.requiredField : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.requiredField : constantObj.messages.requiredField)
		};
		res.status(200).json(response);
	}

}

exports.userList = function(req, res) {
	console.log(req.body)
	var page = req.body.page || 1,
		count = req.body.count || 1;
	var skipNo = (page - 1) * count;

	var sortdata = {};
	var sortkey = null;
	for (key in req.body.sort) {
		sortkey = key;
	}
	if (sortkey) {
		var sortquery = {};
		sortquery[sortkey ? sortkey : '_id'] = req.body.sort ? (req.body.sort[sortkey] == 'desc' ? -1 : 1) : -1;
	}
	//console.log("-----------query-------", query);
	console.log("sortquery", sortquery);
	console.log("page", page);
	console.log("count", count);
	console.log("skipNo", skipNo);
	var query = {};
	var searchStr = req.body.search;
	if (req.body.search) {
		query.$or = [{
			first_name: new RegExp(searchStr, 'i')

		}, {
			last_name: new RegExp(searchStr, 'i')
		}, {
			gender: new RegExp(searchStr, 'i')
		}, {
			phone: new RegExp(searchStr, 'i')
		}]
	}
	query.isDeleted = false;
	console.log("-----------query-------", query);
	userObj.find(query).exec(function(err, data) {
		if (err) {
			console.log(err)
		} else {
			var length = data.length;
			userObj.find(
					query
				).skip(skipNo).limit(count).sort(sortquery)
				.exec(function(err, data1) {
					//console.log(data)
					if (err) {
						console.log("tttte", err)
						outputJSON = {
							'status': 'failure',
							'messageId': 203,
							'message': 'data not retrieved '
						};
					} else {
						outputJSON = {
							'status': 'success',
							'messageId': 200,
							'message': 'data retrieve from products',
							'data': data1,
							'count': length
						}
					}
					res.status(200).jsonp(outputJSON);
				})
		}
	})
}

var saveSetting = function(data) {
	console.log(data);
	var saveSettingObj = {};
	saveSettingObj.user_id = data._id;

	if (data.gender == 'Male') {
		saveSettingObj.male = true;
		saveSettingObj.female = true;
	} else if (data.gender == 'Female') {
		saveSettingObj.male = true;
		saveSettingObj.female = true;
	}

	// saveSettingObj.education_level = ['58b3cc8eb0557501b6fffe7b','58b3cc96b0557501b6fffe7c','58b3cceab0557501b6fffe7d'];
	settingObj(saveSettingObj).save(saveSettingObj, function(err, data) {
		if (err) {
			console.log("error in saving the setting");
		} else {
			console.log("Default User setting successfully Saved");
		}
	})
}


//forgot password
exports.forgotPassword = function(req, res) {

	var outputJSON = "";
	console.log(req.body)

	userObj.findOne({
		email: req.body.username
	}, {
		'first_name': 1,
		'last_name': 1,
		'email': 1,
		'password': 1
	}, function(err, data) {
		console.log(data);
		if (err) {
			outputJSON = {
				'status': 'failure',
				'messageId': 203,
				'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
			};
		} else {

			if (data) {
				var key = 'MySecretKey12345';
				var iv = '1234567890123456';
				var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
				var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
				var decrypted = decipher.update(data.password, 'hex', 'binary');
				decrypted += decipher.final('binary');

				console.log('Decrypted: ', decrypted);
				if (data.first_name == undefined) {
					data.first_name = "";
				}
				/* Send Email to Patient */

				var userDetails = {};
				userDetails.email = data.email;
				userDetails.username = data.username;
				userDetails.pass = decrypted;
				userDetails.firstname = data.first_name;
				userDetails.app_link = "<a href='http://www.google.com'>Link</a>";
				// adminDetail.password = common.encrypt(userDetails.pass);
				var frm = 'Oddjob<noreply@oddjob.com>';
				var emailSubject = 'Password recovery';

				var emailTemplate = 'password_recovery.html';

				emailService.send(userDetails, emailSubject, emailTemplate, frm);


				outputJSON = {
					'status': 'success',
					'messageId': 200,
					'message': constantObj.messages.successSendingForgotPasswordEmail
				}
			} else {
				outputJSON = {
					'status': 'failure',
					'messageId': 203,
					'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
				};
			}

		}

		res.jsonp(outputJSON);

	});
}

/**
 * Find role by id
 * Input: roleId
 * Output: Role json object
 * This function gets called automatically whenever we have a roleId parameter in route. 
 * It uses load function which has been define in role model after that passes control to next calling function.
 */
exports.user = function(req, res, next, id) {
	userObj.load(id, function(err, user) {
		if (err) {
			res.jsonp(err);
		} else if (!user) {
			res.jsonp({
				err: 'Failed to load role ' + id
			});
		} else {

			req.userData = user;
			//console.log(req.user);
			next();
		}
	});
};

exports.updateUserInformation = function(req, res) {

	var detailsData = JSON.parse(JSON.stringify(req.body));
	userObj.update({
		_id: req.body._id
	}, detailsData, function(err, data) {
		var messages = '';
		var errMessage = '';
		var status = '';
		console.log("data", data);
		console.log("err", err);
		if (err) {

			for (var errName in err.errors) {
				errMessage += err.errors[errName].message + "\n";
			}
			messages += errMessage;
			console.log(errMessage);
			status = '201';
			if (err.code == '11000') {
				messages += req.headers.lang == "chtrad" ? chtradconstantObj.messages.wrongInp : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.wrongInp : constantObj.messages.wrongInp);
			}
			var response = {
				"status": 'failure',
				"messageId": 401,
				"message": req.headers.lang == "chtrad" ? chtradconstantObj.messages.validInformation : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.validInformation : constantObj.messages.validInformation)

			};
			res.status(200).json(response);
		} else {
			userObj.findOne({
				_id: req.body._id
			}, function(errInFinding, resultInFind) {
				if (err) {
					console.log("error in finding", err);
				} else {

					var response = {
						"status": 'success',
						"messageId": 200,
						"message": "Data update successfully.",
						"data": resultInFind
					};

					res.status(200).jsonp(response);
				}
			})
		}
	})
}

exports.updateImage = function(req, res) {
	console.log("req.body", req.body)
	console.log("req.files", req.files)
	if (req.body.type == "update") {
		var extension = getFileExtension(req.files[0].filename); //returs xsl
		function getFileExtension(filename) {
			var ext = /^.+\.([^.]+)$/.exec(filename);
			return ext == null ? "" : ext[1];
		}
		if (extension == 'mov' || extension == 'mp4' || extension == '3gp' || extension == 'mkv') {
			var thumbnail = req.files[0].filename.substring(0, req.files[0].filename.lastIndexOf('.')) + '.jpeg';
			getDimensions('http://52.39.212.226:4065/assets/upload/profileImg/' + req.files[0].filename).then(function(dimensions) {
				videoScreen('http://52.39.212.226:4065/assets/upload/profileImg/' + req.files[0].filename, {
					height: dimensions.width,
					width: dimensions.height
				}, function(err, screenshot) {
					let writePath = path.resolve(__dirname, '..', '..', '..', 'public', 'assets', 'upload', 'screenshots', thumbnail);
					fs.writeFile(writePath, screenshot, function(video) {});
				});
			})
		}
		console.log("thumbnail", thumbnail)
		if (extension == 'mov' || extension == 'mp4' || extension == '3gp' || extension == 'mkv') {
			getDuration('http://52.39.212.226:4065/assets/upload/profileImg/' + req.files[0].filename).then((duration) => {
				console.log("duration is ", duration);
				userObj.update({
					"_id": req.body._id,
					"userImages._id": req.body.imageId
				}, {
					$set: {
						"userImages.$.name": req.files[0].filename,
						"userImages.$.thumbnail": thumbnail,
						"userImages.$.duration": duration
					}
				}).exec(function(err, data) {
					if (err) {
						var response = {
							"status": 'failure',
							"messageId": 401,
							"message": err

						};
						console.log("err", err)
						res.status(200).json(response);
					} else {

						userObj.findOne({
							_id: req.body._id
						}, function(errInFinding, resultInFind) {
							if (err) {
								console.log("error in finding", err);
							} else {
								var response = {
									"status": 'success',
									"messageId": 200,
									"message": "Image has been updated successfully.",
									"data": resultInFind
								};

								res.status(200).jsonp(response);
								console.log("final data11111", response)
							}
						})

						//res.status(200).json(response);

					}
				})
			});

		} else {
			userObj.update({
				"_id": req.body._id,
				"userImages._id": req.body.imageId
			}, {
				$set: {
					"userImages.$.name": req.files[0].filename
				}
			}).exec(function(err, data) {
				if (err) {
					var response = {
						"status": 'failure',
						"messageId": 401,
						"message": err

					};
					console.log("err", err)
					res.status(200).json(response);
				} else {

					userObj.findOne({
						_id: req.body._id
					}, function(errInFinding, resultInFind) {
						if (err) {
							console.log("error in finding", err);
						} else {
							var response = {
								"status": 'success',
								"messageId": 200,
								"message": "Image has been updated successfully.",
								"data": resultInFind
							};

							res.status(200).jsonp(response);
							console.log("final data11111", response)
						}
					})
				}
			})
		}


	} else if (req.body.type == "add") {
		var extension = getFileExtension(req.files[0].filename); //returs xsl
		function getFileExtension(filename) {
			var ext = /^.+\.([^.]+)$/.exec(filename);
			return ext == null ? "" : ext[1];
		}
		console.log("extension is", extension)
		if (extension == 'mov' || extension == 'mp4' || extension == '3gp' || extension == 'mkv') {
			var thumbnail = req.files[0].filename.substring(0, req.files[0].filename.lastIndexOf('.')) + '.jpeg';
			getDimensions('http://52.39.212.226:4065/assets/upload/profileImg/' + req.files[0].filename).then(function(dimensions) {
				videoScreen('http://52.39.212.226:4065/assets/upload/profileImg/' + req.files[0].filename, {
					height: dimensions.width,
					width: dimensions.height
				}, function(err, screenshot) {
					let writePath = path.resolve(__dirname, '..', '..', '..', 'public', 'assets', 'upload', 'screenshots', thumbnail);
					fs.writeFile(writePath, screenshot, function(video) {});
				});
			})
		}
		var userimg = {};
		userimg.name = req.files[0].filename;

		getDuration('http://52.39.212.226:4065/assets/upload/profileImg/' + req.files[0].filename).then((duration) => {
			if (extension == 'mov' || extension == 'mp4' || extension == '3gp' || extension == 'mkv') {
				console.log("thumbnail", thumbnail)
				userimg.duration = duration;
				userimg.thumbnail = thumbnail;
			}
			userObj.update({
				_id: req.body._id
			}, {
				$push: {
					userImages: userimg
				}
			}).exec(function(err, data) {
				var messages = '';
				var errMessage = '';
				var status = '';
				console.log("data", data);
				console.log("err", err);
				if (err) {
					var response = {
						"status": 'failure',
						"messageId": 401,
						"message": req.headers.lang == "chtrad" ? chtradconstantObj.messages.validInformation : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.validInformation : constantObj.messages.validInformation)
					};
					res.status(200).json(response);

				} else {

					userObj.findOne({
						_id: req.body._id
					}, function(errInFinding, resultInFind) {
						if (err) {
							console.log("error in finding", err);
						} else {
							var response = {
								"status": 'success',
								"messageId": 200,
								"message": "Image has been updated successfully.",
								"data": resultInFind
							};

							res.status(200).jsonp(response);
							console.log("final data22222", response)
						}
					})
				}
			})
		});


	} else {
		userObj.update({
			_id: req.body._id
		}, {
			$pull: {
				userImages: {
					_id: {
						$in: req.body.imageId
					}
				}
			}
		}).exec(function(errInDelete, data) {
			if (errInDelete) {
				console.log("Error in deleteing images", errInDelete)
			} else {
				//console.log("resultInDelete",resultInDelete)
				userObj.findOne({
					_id: req.body._id
				}, function(errInFinding, resultInFind) {
					if (errInFinding) {
						console.log("error in finding", errInDelete);
					} else {
						var response = {
							"status": 'success',
							"messageId": 200,
							"message": "Image has been updated successfully.",
							"data": resultInFind
						};
						//console.log("resultInFind",resultInFind)
						res.status(200).jsonp(response);
					}
				})

				//res.status(200).json(response);

			}
		})
	}
}



/**
 * Show user by id
 * Input: User json object
 * Output: Role json object
 * This function gets role json object from exports.role 
 */
exports.findOne = function(req, res) {
	if (!req.userData) {
		outputJSON = {
			'status': 'failure',
			'messageId': 203,
			'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
		};
	} else {
		outputJSON = {
			'status': 'success',
			'messageId': 200,
			'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.successRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.successRetreivingData : constantObj.messages.successRetreivingData),
			'data': req.userData
		}
	}
	res.jsonp(outputJSON);
};
/**
 * Show user by id
 * Input: User json object
 * Output: Role json object
 * This function gets role json object from exports.role 
 */
exports.getOne = function(req, res) {

	userObj.findOne({
			_id: req.params.id
		})
		.exec(function(error, data) {
			if (!data) {
				outputJSON = {
					'status': 'failure',
					'messageId': 203,
					'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
				};
			} else {
				outputJSON = {
					'status': 'success',
					'messageId': 200,
					'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.successRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.successRetreivingData : constantObj.messages.successRetreivingData),
					'data': data
				}
			}
			res.jsonp(outputJSON);
		})
};

exports.unSubscribe = function(req, res) {
	if (req.body._id) {
		userObj.update({
			_id: req.body._id
		}, {
			$set: {
				"subScribeNewsLetter": false
			}
		}, function(err, data) {
			if (err) {
				var response = {
					"status": 'failure',
					"messageId": 401,
					"message": "unable to unSubscribe"
				};
				res.status(200).json(response);
			} else {
				if (data.nModified == 1) {
					var response = {
						"status": 'success',
						"messageId": 200,
						"message": "newsLetter unSubscribe successfully.",
						"data": data
					};
				} else {
					var response = {
						"status": 'failure',
						"messageId": 401,
						"message": "Already newsLetter is unSubscribed.",
						"data": data
					};
				}
				res.status(200).json(response);

			}
		})
	} else {
		res.status(401).jsonp({
			"status": 'failure',
			"messageId": 401,
			"message": "Please sent required fields."
		})
	}
}

/**
 * Show skill by userid
 * Input: skill json object
 * Output: skill json object
 * This function gets role json object from exports.role 
 */
exports.userSkills = function(req, res) {

	userObj.find({
			_id: req.params.id
		}).populate({
			//path:'skill',select: 'skill image'
			path: 'skill',
			match: {
				"is_deleted": false,
				"enable": true
			}
		})
		.exec(function(error, data) {

			console.log(data[0])


			if (error) {
				outputJSON = {
					'status': 'failure',
					'messageId': 203,
					'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
				};
			} else {
				outputJSON = {
					'status': 'success',
					'messageId': 200,
					'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.successRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.successRetreivingData : constantObj.messages.successRetreivingData),
					'data': data[0].skill
				}
			}

			res.jsonp(outputJSON);

		});

};

exports.logout = function(req, res) {
	if (req.body.access_token) {
		userTokenObj.remove({
			token: req.body.access_token
		}, function(err, result) {
			if (err) {
				outputJSON = {
					'status': 'failure',
					'messageId': 203,
					'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
				};

			} else {
				outputJSON = {
					'status': 'success',
					'messageId': 200,
					'message': "User has been logout susseccfuly"
				}

			}
			res.jsonp(outputJSON);
		})
	}
}

/**
 * List all user object
 * Input: 
 * Output: User json object
 */
exports.list = function(req, res) {
		console.log("in list");
		var outputJSON = "";
		userObj.find({
			is_deleted: false
		}, function(err, data) {
			if (err) {
				outputJSON = {
					'status': 'failure',
					'messageId': 203,
					'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
				};
			} else {
				outputJSON = {
					'status': 'success',
					'messageId': 200,
					'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.successRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.successRetreivingData : constantObj.messages.successRetreivingData),
					'data': data
				}
			}
			res.jsonp(outputJSON);
		});
	}
	/**
	 * Latest user object
	 * Input: 
	 * Output: User json object
	 */
exports.latestUser = function(req, res) {

		var outputJSON = "";
		userObj.find({
			isDeleted: false
		}, {
			first_name: 1,
			last_name: 1,
			email: 1,
			userImages: 1,
			profile_image: 1,
			facebook_id: 1,
			created_date: 1
		}).sort({
			created_date: -1
		}).limit(8).exec(function(err, data) {
			if (err) {
				outputJSON = {
					'status': 'failure',
					'messageId': 203,
					'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
				};
			} else {
				outputJSON = {
					'status': 'success',
					'messageId': 200,
					'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.successRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.successRetreivingData : constantObj.messages.successRetreivingData),
					'data': data
				}
			}
			res.jsonp(outputJSON);
		});
	}
	/**
	 * List all user object
	 * Input: 
	 * Output: User json object
	 */
exports.totalUser = function(req, res) {

	var outputJSON = "";
	userObj.count({
		isDeleted: false
	}, function(err, data) {
		if (err) {
			outputJSON = {
				'status': 'failure',
				'messageId': 203,
				'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
			};
		} else {
			outputJSON = {
				'status': 'success',
				'messageId': 200,
				'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.successRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.successRetreivingData : constantObj.messages.successRetreivingData),
				'data': data
			}
		}
		res.jsonp(outputJSON);
	});
}


/**
 * Create new user object
 * Input: User object
 * Output: User json object with success
 */
exports.add = function(req, res) {
	var errorMessage = "";
	var outputJSON = "";
	var userModelObj = {};
	var password = req.body.password;
	if (req.body.password != undefined) {
		var key = 'MySecretKey12345';
		var iv = '1234567890123456';
		var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
		var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
		var encrypted = cipher.update(req.body.password, 'utf8', 'binary');
		encrypted += cipher.final('binary');
		hexVal = new Buffer(encrypted, 'binary');
		newEncrypted = hexVal.toString('hex');
		req.body.password = newEncrypted;
		if (req.body.user_name == undefined) {
			req.body.user_name = req.body.email;
		}

	}
	userModelObj = req.body;

	userObj(userModelObj).save(req.body, function(err, data) {
		if (err) { //console.log(err);
			switch (err.name) {
				case 'ValidationError':

					for (field in err.errors) {
						if (errorMessage == "") {
							errorMessage = err.errors[field].message;
						} else {
							errorMessage += ", " + err.errors[field].message;
						}
					} //for
					break;
			} //switch

		} //if
		else {
			reqdata = {};
			reqdata._id = data._id;
			if (req.body.profile_image != undefined) {
				reqdata.profile_image = req.body.profile_image;

				uploadProImg(reqdata, function(responce) {
					outputJSON = {
						'status': 'success',
						'messageId': 200,
						'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.userSuccess : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.userSuccess : constantObj.messages.userSuccess),
						'data': data
					};
					res.jsonp(outputJSON);
				});
			} else {
				// var saveData = req.body;
				// saveData.latLong = [req.headers.lng, req.headers.lat]
				// adminLoginObj(saveData).save(saveData, function(err, settingdata) {
				// 	if (err) {
				// 		console.log("err.code", err.code);
				// 	} else {
				// 		saveSetting(settingdata);
				// 	}
				// })
				outputJSON = {
					'status': 'success',
					'messageId': 200,
					'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.userSuccess : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.userSuccess : constantObj.messages.userSuccess),
					'data': data
				};
				res.jsonp(outputJSON);
			}
		}
	});



}


/**
 * Update user object
 * Input: User object
 * Output: User json object with success
 */
exports.update = function(req, res) {
		//console.log('update_user',req.body)
		var errorMessage = "";
		var outputJSON = "";
		var user = req.userData;
		user.first_name = req.body.first_name;
		user.last_name = req.body.last_name;
		user.email = req.body.email;
		user.user_name = req.body.user_name.toLowerCase();
		user.display_name = req.body.display_name;
		user.phone = req.body.phone;
		user.role = req.body.role;
		user.skill = req.body.skill;
		user.zipcode = req.body.zipcode;
		user.enable = req.body.enable;
		user.about_me = req.body.about_me;
		//console.log(user);return false;


		user.save(function(err, data) {
			console.log(err);
			//console.log(data);
			if (err) {
				switch (err.name) {
					case 'ValidationError':
						for (field in err.errors) {
							if (errorMessage == "") {
								errorMessage = err.errors[field].message;
							} else {
								errorMessage += "\r\n" + err.errors[field].message;
							}
						} //for
						break;
				} //switch
				outputJSON = {
					'status': 'failure',
					'messageId': 401,
					'message': errorMessage
				};
				res.jsonp(outputJSON);
			} //if
			else {

				if (req.body.prof_image != "" && req.body.prof_image != undefined) {
					reqdata = {};
					reqdata._id = req.body._id;
					reqdata.prof_image = req.body.prof_image;
					console.log(" image In")
					uploadProImg(reqdata, function(responce) {
						console.log(responce);
						if (req.body.cover_image == "" || req.body.cover_image == undefined) {
							console.log("no cover image ")
							userObj.find({
									_id: data._id
								}).populate({
									path: 'skill',
									select: 'skill image',
									match: {
										"is_deleted": false,
										"enable": true
									}
								})
								.exec(function(error, dataRes) {
									//console.log("here",dataRes);

									if (error) {
										outputJSON = {
											'status': 'failure',
											'messageId': 203,
											'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
										};
									}
									outputJSON = {
										'status': 'success',
										'messageId': 200,
										'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.userStatusUpdateSuccess : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.userStatusUpdateSuccess : constantObj.messages.userStatusUpdateSuccess),
										'data': dataRes[0]
									};
									res.jsonp(outputJSON);


								});
						}
					});
				}
				if (req.body.cover_image != "" && req.body.cover_image != undefined) {
					console.log("cover image In")
					reqdata = {};
					reqdata._id = req.body._id;
					reqdata.cover_image = req.body.cover_image;

					uploadProImg(reqdata, function(responce) {
						console.log(responce);

						userObj.find({
								_id: data._id
							}).populate({
								path: 'skill',
								select: 'skill image',
								match: {
									"is_deleted": false,
									"enable": true
								}
							})
							.exec(function(error, dataRes) {
								//console.log("here",dataRes);

								if (error) {
									outputJSON = {
										'status': 'failure',
										'messageId': 203,
										'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
									};
								}
								outputJSON = {
									'status': 'success',
									'messageId': 200,
									'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.userStatusUpdateSuccess : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.userStatusUpdateSuccess : constantObj.messages.userStatusUpdateSuccess),
									'data': dataRes[0]
								};
								res.jsonp(outputJSON);


							});
					});
				} else {
					userObj.find({
							_id: data._id
						}).populate({
							path: 'skill',
							select: 'skill image',
							match: {
								"is_deleted": false,
								"enable": true
							}
						})
						.exec(function(error, dataRes) {
							//console.log("here",dataRes);

							if (error) {
								outputJSON = {
									'status': 'failure',
									'messageId': 203,
									'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
								};
							}
							outputJSON = {
								'status': 'success',
								'messageId': 200,
								'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.userStatusUpdateSuccess : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.userStatusUpdateSuccess : constantObj.messages.userStatusUpdateSuccess),
								'data': dataRes[0]
							};
							res.jsonp(outputJSON);


						});
				}

				//outputJSON = {'status': 'success', 'messageId':200, 'message':constantObj.messages.userStatusUpdateSuccess, 'data': data};
			}

		});
	}
	/**
	 * Update user Image object(s) (Bulk update)
	 * Input: userId,image or cover image object(s)
	 * Output: Success message
	 * This function is used to for bulk updation for user object(s)
	 */
exports.updateUserdata = function(req, res) {

	reqdata = {};
	reqdata._id = req.body._id;
	if (req.body.profile_image != undefined)
		reqdata.profile_image = req.body.profile_image;

	if (req.body.profile_image != undefined)
		reqdata.profile_image = req.body.profile_image;
	if (req.body.profile_image != undefined) {
		uploadProImg(reqdata, function(responce) {
			//console.log(responce);
			//outputJSON = {'status':'success', 'messageId':200, 'message':constantObj.messages.userStatusUpdateSuccess,'data':responce};
			//	res.jsonp(outputJSON);
			delete req.body.profile_image;
			delete req.body.userImages;

			userObj.update({
				'_id': req.body._id
			}, {
				$set: req.body
			}, function(err, res1) {
				console.log(err);
				if (err) {
					outputJSON = {
						'status': 'failure',
						'messageId': 203,
						'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
					};
				}
				outputJSON = {
					'status': 'success',
					'messageId': 200,
					'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.userStatusUpdateSuccess : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.userStatusUpdateSuccess : constantObj.messages.userStatusUpdateSuccess),
					'data': res1[0]
				};
				res.jsonp(outputJSON);
			});


		});
	} else {
		userObj.update({
			'_id': req.body._id
		}, {
			$set: req.body
		}, function(err, res1) {
			console.log(err);
			if (err) {
				outputJSON = {
					'status': 'failure',
					'messageId': 203,
					'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
				};
			}
			outputJSON = {
				'status': 'success',
				'messageId': 200,
				'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.userStatusUpdateSuccess : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.userStatusUpdateSuccess : constantObj.messages.userStatusUpdateSuccess),
				'data': res1[0]
			};
			res.jsonp(outputJSON);
		});
	}
}

/**
 * Update user object(s) (Bulk update)
 * Input: user object(s)
 * Output: Success message
 * This function is used to for bulk updation for user object(s)
 */
exports.bulkUpdate = function(req, res) {
		var outputJSON = "";
		var inputData = req.body;
		var roleLength = inputData.data.length;
		var bulk = userObj.collection.initializeUnorderedBulkOp();
		for (var i = 0; i < roleLength; i++) {
			var userData = inputData.data[i];
			var id = mongoose.Types.ObjectId(userData.id);
			bulk.find({
				_id: id
			}).update({
				$set: userData
			});
		}
		bulk.execute(function(data) {
			outputJSON = {
				'status': 'success',
				'messageId': 200,
				'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.userStatusUpdateSuccess : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.userStatusUpdateSuccess : constantObj.messages.userStatusUpdateSuccess)
			};
			res.jsonp(outputJSON);
		});

	}
	/**
	 * Update user object(s) (Approve By admin)
	 * Input: user object(s)
	 * Output: Success message
	 * This function is used to for bulk updation for user object(s)
	 */
exports.approve = function(req, res) {
	var outputJSON = "";
	var inputData = req.body;
	var roleLength = inputData.data.length;
	var bulk = userObj.collection.initializeUnorderedBulkOp();
	for (var i = 0; i < roleLength; i++) {
		var userData = inputData.data[i];
		var id = mongoose.Types.ObjectId(userData.id);
		bulk.find({
			_id: id
		}).update({
			$set: userData
		});
	}
	bulk.execute(function(data) {
		outputJSON = {
			'status': 'success',
			'messageId': 200,
			'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.userStatusUpdateSuccess : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.userStatusUpdateSuccess : constantObj.messages.userStatusUpdateSuccess)
		};

		userObj.findOne({
			_id: id
		}, {
			'first_name': 1,
			'last_name': 1,
			'email': 1,
			'password': 1
		}, function(err, data) {
			console.log(data);
			if (err) {
				outputJSON = {
					'status': 'failure',
					'messageId': 203,
					'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
				};
			} else {

				if (data) {

					if (data.first_name == undefined) {
						data.first_name = "";
					}
					/* Send Email to Patient */

					var userDetails = {};
					userDetails.email = data.email;
					userDetails.username = data.username;
					userDetails.firstname = data.first_name;
					userDetails.app_link = "<a href='http://www.google.com'>Link</a>";
					var frm = 'Oddjob<noreply@oddjob.com>';
					var emailSubject = 'Account verification';

					var emailTemplate = 'account_varification.html';

					emailService.send(userDetails, emailSubject, emailTemplate, frm);


					outputJSON = {
						'status': 'success',
						'messageId': 200,
						'message': constantObj.messages.successSendingForgotPasswordEmail
					}
				} else {
					outputJSON = {
						'status': 'failure',
						'messageId': 203,
						'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)
					};
				}

			}

			res.jsonp(outputJSON);

		});


	});
	//res.jsonp(outputJSON);
}

uploadProImg = function(data, callback) {

	//console.log("data",data);
	var photoname = data._id + '_' + Date.now() + '.jpg';

	var folder = "";
	var updateField = {
		'profile_image': photoname
	};
	var height = 125;
	var width = 125;

	var imagename = __dirname + "/../../../public/assets/upload/profileImg/" + folder + photoname;
	if (data.profile_image.indexOf("base64,") != -1) {
		var Data = data.profile_image.split('base64,');
		var base64Data = Data[1];
		var saveData = {};

		saveData.userImages = [{
			name: photoname
		}];

		//console.log("asdfasdsa",saveData)

		fs.writeFile(imagename, base64Data, 'base64', function(err) {
			if (err) {
				console.log(err);
				callback("Failure Upload");


			} else {

				userObj.update({
					'_id': data._id
				}, {
					$set: {
						"userImages": [{
							name: photoname
						}]
					}
				}, function(err, res) {
					console.log(res);
					callback(saveData);
				});


			}
		});
	} else {
		callback("Image  not selected");
	}
}


exports.resetPassword = function(req, res) {
	var pswdd = JSON.parse(JSON.stringify(req.body.newpassword));
	newpassword = md5(pswdd);
	userObj.update({
		phone: req.body.phone
	}, {
		$set: {
			password: newpassword
		}
	}, function(err, data) {

		if (err) {
			outputJSON = {
				'status': 'failure',
				'messageId': 203,
				'message': constantObj.messages.errorSendingForgotPasswordEmail
			};
		} else {

			outputJSON = {
				'status': 'success',
				'messageId': 200,
				'message': "Password has been changed successfully"
			}
		}


		res.jsonp(outputJSON);

	});
}


exports.adminChangePassword = function(req, res) {
	console.log(req.body);
	if (req.body.oldPassword && req.body.password) {
		var oldPassword = req.body.oldPassword;
		var password = req.body.password;
		var savepswd = md5(req.body.password);
		var confirmPassword = req.body.password;

		userObj.findOne({
			_id: req.body._id
		}, function(err, data) {
			if (err) {
				console.log("inside first err");
				var messages = '';
				var errMessage = '';
				var status = '';
				for (var errName in err.errors) {
					errMessage += err.errors[errName].message + "\n";
				}
				messages += errMessage;
				messages += 'Something happen wrong';
				status = '201';
				if (err.code == '11000') {
					messages += 'Something happen wrong';
				}
				var response = {
					"status": 'failure',
					"messageId": 401,
					"message": messages
				};
				res.status(200).json(response);
			} else {
				console.log(data)
				if (data != null) {
					if (data.password == md5(oldPassword)) {
						if (password === confirmPassword) {
							userObj.update({
								_id: req.body._id
							}, {
								$set: {
									"password": savepswd
								}
							}, function(err, data) {
								var messages = '';
								var errMessage = '';
								var status = '';
								if (err) {
									for (var errName in err.errors) {
										errMessage += err.errors[errName].message + "\n";
									}
									messages += errMessage;
									status = '201';
									if (err.code == '11000') {
										messages += 'Something happen wrong';
									}
									var response = {
										"status": 'failure',
										"messageId": 401,
										"message": messages
									};
									res.status(200).json(response);
								} else {
									if (data.nModified == 1) {
										var response = {
											"status": 'success',
											"messageId": 200,
											"message": "Password has been changed successfully.",
											"data": data
										};
									} else {
										var response = {
											"status": 'failure',
											"messageId": 401,
											"message": "Your new password should not be same as current password.",
											"data": data
										};
									}
									res.status(200).json(response);
								}
							})
						} else {
							var response = {
								"status": 'failure',
								"messageId": 401,
								"message": "The password you have entered does not match with your current password."
							};
							res.status(200).json(response);
						}
					} else {
						res.status(200).jsonp({
							"status": 'failure',
							"messageId": 401,
							'message': "Old password is incorrect."
						})
					}
				} else {
					res.status(200).jsonp({
						"status": 'failure',
						"messageId": 401,
						'message': "User not found."
					})
				}
			}
		})
	} else {
		res.status(401).jsonp({
			"status": 'failure',
			"messageId": 401,
			"message": "Please sent required fields."
		})
	}
}

//change password

exports.changePassword = function(req, res) {
	console.log(req.body);
	if (req.body.oldPassword && req.body.password) {
		var oldPassword = req.body.oldPassword;
		var password = req.body.password;
		var savepswd = md5(req.body.password);
		var confirmPassword = req.body.password;

		userObj.findOne({
			_id: req.body._id
		}, function(err, data) {
			if (err) {
				console.log("inside first err");
				var messages = '';
				var errMessage = '';
				var status = '';
				for (var errName in err.errors) {
					errMessage += err.errors[errName].message + "\n";
				}
				messages += errMessage;
				messages += 'Something happen wrong';
				status = '201';
				if (err.code == '11000') {
					messages += 'Something happen wrong';
				}
				var response = {
					"status": 'failure',
					"messageId": 401,
					"message": messages
				};
				res.status(200).json(response);
			} else {
				console.log(data)
				if (data != null) {
					if (data.password == md5(oldPassword)) {
						if (password === confirmPassword) {
							userObj.update({
								_id: req.body._id
							}, {
								$set: {
									"password": savepswd
								}
							}, function(err, data) {
								var messages = '';
								var errMessage = '';
								var status = '';
								if (err) {
									for (var errName in err.errors) {
										errMessage += err.errors[errName].message + "\n";
									}
									messages += errMessage;
									status = '201';
									if (err.code == '11000') {
										messages += 'Something happen wrong';
									}
									var response = {
										"status": 'failure',
										"messageId": 401,
										"message": messages
									};
									res.status(200).json(response);
								} else {
									if (data.nModified == 1) {
										var response = {
											"status": 'success',
											"messageId": 200,
											"message": "Password has been changed successfully.",
											"data": data
										};
									} else {
										var response = {
											"status": 'failure',
											"messageId": 401,
											"message": "Your new password should not be same as current password.",
											"data": data
										};
									}
									res.status(200).json(response);
								}
							})
						} else {
							var response = {
								"status": 'failure',
								"messageId": 401,
								"message": "The password you have entered does not match with your current password."
							};
							res.status(200).json(response);
						}
					} else {
						res.status(200).jsonp({
							"status": 'failure',
							"messageId": 401,
							'message': "Old password is incorrect."
						})
					}
				} else {
					res.status(200).jsonp({
						"status": 'failure',
						"messageId": 401,
						'message': "User not found."
					})
				}
			}
		})
	} else {
		res.status(401).jsonp({
			"status": 'failure',
			"messageId": 401,
			"message": "Please sent required fields."
		})
	}
}

exports.deleteUser = function(req, res) {

	if (req.body._id) {
		userObj.update({
			_id: req.body._id
		}, {
			$set: {
				isDeleted: true
			}
		}, function(err, updRes) {
			if (err) {
				console.log(err);
			} else {
				console.log("device id updated", updRes);
				outputJSON = {
					'status': 'failure',
					'messageId': 203,
					'data': updRes,
					'message': "User has been deleted successfully"
				};
				res.jsonp(outputJSON);


			}

		})
	}

}

exports.cred = function(req, res) {
	res.status(200).jsonp({
		"status": 'success',
		"messageId": 200,
		"Application ID": 55532,
		"authKey": "b8L6tTNjSTWRLeD",
		"authSecret": "Yrmcb4EPWd9H7Yp"
	})
}

exports.getCurrentUserData = function(req, res) {
	userObj.findOne({
			_id: req.body._id
		}, {
			password: 0
		})
		.exec(function(err, data) {
			if (err) {
				onsole.log(err);
				outputJSON = {
					'status': 'failure',
					'messageId': 203,
					'message': req.headers.lang == "chtrad" ? chtradconstantObj.messages.errorRetreivingData : (req.headers.lang == "chsimp" ? chsimpconstantObj.messages.errorRetreivingData : constantObj.messages.errorRetreivingData)

				};
				res.status(200).jsonp(outputJSON);
			} else {
				res.status(200).jsonp({
					'status': 'success',
					'messageId': 200,
					'data': data,
					'imagesPath': 'http://' + req.headers.host + '/' + 'assets/upload/profileImg/'
				});
			}
		})
}

exports.viewProfile = function(req, res) {
	//req.headers.lat="37.927360";
	//  req.headers.lng="-122.319034";
	if (req.headers.lat == '' && req.headers.lng == '') {
		req.headers.lat = "0";
		req.headers.lng = "0";
	}
	if (req.body._id) {
		var id = req.body._id;
		userObj.findOne({
			_id: req.body._id
		}).exec(function(err, data) {
			if (err) {
				var response = {
					"status": 'failure',
					"messageId": 401,
					"message": "Sorry problem to get data .",
					"data": data
				};
				res.status(401).jsonp(response);
			} else {

				var dist;

				if (data.latLong != undefined) {
					dist = geodist([req.headers.lng, req.headers.lat], data.latLong, {
						exact: true,
						unit: 'mi'
					})
					if (dist == 0 || dist == 1) {
						data.distance = "less than a mile away";

					} else {
						data.distance = dist.toFixed(0) + " miles away";
					}
				}


				var response = {
					"status": 'success',
					"messageId": 200,
					"message": "Data retrieve successfully.",
					"data": data
				};
				res.status(200).jsonp(response);
			}
		})
	} else {
		res.status(401).jsonp({
			"message": "Please sent required parameters."
		})
	}
}

exports.removeUser = function(req, res) {
	console.log(req.body);

	if (req.body._id) {
		userObj.remove({
			_id: req.body._id
		}, function(err, updRes) {
			if (err) {
				console.log(err);
			} else {
				//console.log("device id updated", updRes);
				outputJSON = {
					'status': 'success',
					'messageId': 200,
					'message': "User has been removed successfully"
				};
				res.jsonp(outputJSON);


			}

		})
	}

}

exports.likesleft = function(req, res) {
	if (req.body.user_id) {
		likeDislikeObj.find({
			from: req.body.user_id
		}, function(err, data) {
			console.log("likes by user", data.length)
			if (err) {
				var outputJSON = {
					"status": 'faliure',
					"messageId": 401,
					"message": "Error !Please try again later.",
					"err": err
				}
			} else {
				userObj.findOne({
					_id: req.body.user_id
				}, function(err, result) {
					if (err) {
						var outputJSON = {
							"status": 'faliure',
							"messageId": 401,
							"message": "Error !Please try again later.",
							"err": err
						}
					} else {
						var totalleft = result.likesleft - data.length;
						console.log("", totalleft)
						if (result.likesleft > data.length) {

							userObj.update({
								_id: req.body.user_id
							}, {
								$set: {
									likesleft: totalleft
								}
							}, function(err, dataupdated) {
								if (err) {
									var outputJSON = {
										"status": 'faliure',
										"messageId": 401,
										"message": "Error !Please try again later.",
										"err": err
									}
								} else {
									userObj.findOne({
										_id: req.body.user_id
									}, function(err, userdata) {
										if (err) {
											var outputJSON = {
												"status": 'faliure',
												"messageId": 401,
												"message": "Error !Please try again later.",
												"err": err
											}
										} else {
											var outputJSON = {
												"status": 'success',
												"messageId": 200,
												"message": "Data retrieve successfully.",
												"Total Likes Left": userdata.likesleft
											}
											res.status(200).jsonp(outputJSON);
										}
									});
								}
							})
						}
					}
				})

			}
		})
	} else {
		var outputJSON = {
			"status": 'faliure',
			"messageId": 401,
			"message": "Please pass require fields",
		}
		res.jsonp(outputJSON);

	}

}

exports.addlikes = function(req, res) {
	console.log("req.body", req.body)
	if (req.body._id) {

		userObj.findOne({
			_id: req.body._id
		}, function(err, result) {
			if (err) {
				var outputJSON = {
					"status": 'faliure',
					"messageId": 401,
					"message": "Error !Please try again later.",
					"err": err
				}
			} else {
				// var likes = 1;
				var totalleft = result.likesleft + req.body.noOfLikes;

				userObj.update({
					_id: req.body._id
				}, {
					$set: {
						likesleft: totalleft
					}
				}, function(err, dataupdated) {
					if (err) {
						var outputJSON = {
							"status": 'faliure',
							"messageId": 401,
							"message": "Error !Please try again later.",
							"err": err
						}
					} else {
						userObj.findOne({
							_id: req.body._id
						}, function(err, userdata) {
							if (err) {
								var outputJSON = {
									"status": 'faliure',
									"messageId": 401,
									"message": "Error !Please try again later.",
									"err": err
								}
							} else {
								var outputJSON = {
									"status": 'success',
									"messageId": 200,
									"message": "Data retrieve successfully.",
									"likesleft": userdata.likesleft
								}
								res.status(200).jsonp(outputJSON);
							}
						});
					}
				})

			}
		})


	} else {
		var outputJSON = {
			"status": 'faliure',
			"messageId": 401,
			"message": "Please pass require fields",
		}
		res.jsonp(outputJSON);
	}
}


var generateOtp = function() {
	var text = "";
	var possible = "0123456789";
	for (var i = 0; i < 4; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}


exports.usermatchlist = function(req, res) {

	var lng = '76.7029445000000010';
	var lat = '30.7082249999999988';

	var id = mongoose.Types.ObjectId(req.body.id);
	matchListObj.aggregate([{
		$match: {
			user: id
		}
	}, {
		$sort: {
			created: -1
		}
	}, {
		$lookup: {
			from: "users",
			localField: "friends",
			foreignField: "_id",
			as: "users"
		}
	}]).exec(function(err, data) {
		if (err) {
			console.log("err", err)
		} else {

			console.log("ths is only data", data)

			var newMatch = [];
			var oldMatch = [];
			var msgCount = 0;

			messageObj.aggregate([{
				$match: {
					$or: [{
						senderid: id
					}, {
						recieverid: id
					}]
				}
			}]).exec(function(err, msgdata) {

				for (var i = 0; i < data.length; i++) {
					// console.log("users", data[i].users)
					if (data[i].users[0] != null && data[i].users[0] != undefined) {
						dist = geodist([lng, lat], data[i].users[0].latLong, {
								exact: true,
								unit: 'mi'
							})
							// console.log("123123123123123123",dist)
						if (dist == 0 || dist == 1) {

							data[i].users[0].distance = "less than a mile away";

						} else {

							data[i].users[0].distance = dist.toFixed(0) + " miles away";

						}
						newMatch.push(data[i].users[0]);

						console.log("msglength", msgdata)
							//console.log("1")
						for (var j = 0; j < msgdata.length; j++) {
							// console.log("messsage", msgdata[j].message.length)
							if (msgdata[j].message.length != 0) {
								var messageData = {}
								messageData.message = {}
								messageData.chatId = msgdata[j]._id;
								totalCount = 0;
								for (var k = 0; k < msgdata[j].message.length; k++) {
									console.log("isReadAll1", totalCount)
									if (msgdata[j].message[k].is_read == false && msgdata[j].message[k].recieverid.toString() == id) {
										totalCount = totalCount + 1;
									}
									if (msgdata[j].message[k].recieverid.toString() == id) {
										messageData.totalCount = totalCount;
									}
								}

								if ((data[i].friends.toString() == msgdata[j].senderid.toString() && data[i].user.toString() == msgdata[j].recieverid.toString()) || (data[i].friends.toString() == msgdata[j].recieverid.toString() && data[i].user.toString() == msgdata[j].senderid.toString())) {
									messageData.message = msgdata[j].message[msgdata[j].message.length - 1]
									data[i].users[0].msg = messageData;
									oldMatch.push(data[i].users[0]);
									var idx = newMatch.indexOf(data[i].users[0]);
									if (idx > -1) {
										newMatch.splice(idx, 1);

									}

								}
							}
						}
					}
				}

				oldMatch.sort(function(a, b) {
					var dateA = new Date(a.msg.message.created_date),
						dateB = new Date(b.msg.message.created_date)
					return dateB - dateA //sort by date ascending
				})

				var uniqueArray = removeDuplicates(newMatch, "_id");

				function removeDuplicates(originalArray, prop) {
					var newArray = [];
					var lookupObject = {};

					for (var i in originalArray) {
						lookupObject[originalArray[i][prop]] = originalArray[i];
					}

					for (i in lookupObject) {
						newArray.push(lookupObject[i]);
					}
					return newArray;
				}



				console.log("uniqueArray is: ", uniqueArray);
				// conso;
				console.log("newmatch22222", newMatch);
				var outputJSON = {
					"status": 'success',
					"messageId": 200,
					"message": "Data retrieve successfully.",
					"newMatch": uniqueArray,
					"oldMatch": oldMatch
				}
				res.status(200).jsonp(outputJSON);
			});



		}

	});
}

// exports.userinjan = function(req, res) {
// 	userObj.aggregate({
// 		$match: {
// 			gender: "Male"
// 		}
// 	}, {
// 		$project: {
// 			first_name: 1,
// 			last_name: 1,
// 			month: {
// 				$month: '$created'
// 			},
// 			gender: 1
// 		}
// 	}, {
// 		$match: {
// 			month: 1
// 		}
// 	}).exec(function(err, data) {

// 		userObj.aggregate({
// 			$match: {
// 				gender: "Female"
// 			}
// 		}, {
// 			$project: {
// 				first_name: 1,
// 				last_name: 1,
// 				month: {
// 					$month: '$created'
// 				},
// 				gender: 1
// 			}
// 		}, {
// 			$match: {
// 				month: 1
// 			}
// 		}).exec(function(err, data1) {
// 			console.log("here--", data)
// 			var outputJSON = {
// 				"status": 'success',
// 				"messageId": 200,
// 				"message": "Data retrieve successfully.",
// 				"totalmales": data.length,
// 				"totalfemales": data1.length
// 			}
// 			res.status(200).jsonp(outputJSON);
// 		});
// 	});
// }

// exports.userinfeb = function(req, res) {
// 	userObj.aggregate({
// 		$match: {
// 			gender: "Male"
// 		}
// 	}, {
// 		$project: {
// 			first_name: 1,
// 			last_name: 1,
// 			month: {
// 				$month: '$created'
// 			},
// 			gender: 1
// 		}
// 	}, {
// 		$match: {
// 			month: 2
// 		}
// 	}).exec(function(err, data) {

// 		userObj.aggregate({
// 			$match: {
// 				gender: "Female"
// 			}
// 		}, {
// 			$project: {
// 				first_name: 1,
// 				last_name: 1,
// 				month: {
// 					$month: '$created'
// 				},
// 				gender: 1
// 			}
// 		}, {
// 			$match: {
// 				month: 2
// 			}
// 		}).exec(function(err, data1) {
// 			console.log("here--", data)
// 			var outputJSON = {
// 				"status": 'success',
// 				"messageId": 200,
// 				"message": "Data retrieve successfully.",
// 				"totalmales": data.length,
// 				"totalfemales": data1.length
// 			}
// 			res.status(200).jsonp(outputJSON);
// 		});
// 	});
// }

// exports.userinmarch = function(req, res) {
// 	userObj.aggregate({
// 		$match: {
// 			gender: "Male"
// 		}
// 	}, {
// 		$project: {
// 			first_name: 1,
// 			last_name: 1,
// 			month: {
// 				$month: '$created'
// 			},
// 			gender: 1
// 		}
// 	}, {
// 		$match: {
// 			month: 3
// 		}
// 	}).exec(function(err, data) {

// 		userObj.aggregate({
// 			$match: {
// 				gender: "Female"
// 			}
// 		}, {
// 			$project: {
// 				first_name: 1,
// 				last_name: 1,
// 				month: {
// 					$month: '$created'
// 				},
// 				gender: 1
// 			}
// 		}, {
// 			$match: {
// 				month: 3
// 			}
// 		}).exec(function(err, data1) {
// 			console.log("here--", data)
// 			var outputJSON = {
// 				"status": 'success',
// 				"messageId": 200,
// 				"message": "Data retrieve successfully.",
// 				"totalmales": data.length,
// 				"totalfemales": data1.length
// 			}
// 			res.status(200).jsonp(outputJSON);
// 		});
// 	});
// }

// exports.userinapril = function(req, res) {
// 	userObj.aggregate({
// 		$match: {
// 			gender: "Male"
// 		}
// 	}, {
// 		$project: {
// 			first_name: 1,
// 			last_name: 1,
// 			month: {
// 				$month: '$created'
// 			},
// 			gender: 1
// 		}
// 	}, {
// 		$match: {
// 			month: 4
// 		}
// 	}).exec(function(err, data) {

// 		userObj.aggregate({
// 			$match: {
// 				gender: "Female"
// 			}
// 		}, {
// 			$project: {
// 				first_name: 1,
// 				last_name: 1,
// 				month: {
// 					$month: '$created'
// 				},
// 				gender: 1
// 			}
// 		}, {
// 			$match: {
// 				month: 4
// 			}
// 		}).exec(function(err, data1) {
// 			console.log("here--", data)
// 			var outputJSON = {
// 				"status": 'success',
// 				"messageId": 200,
// 				"message": "Data retrieve successfully.",
// 				"totalmales": data.length,
// 				"totalfemales": data1.length
// 			}
// 			res.status(200).jsonp(outputJSON);
// 		});
// 	});
// }

// exports.userinmay = function(req, res) {
// 	userObj.aggregate({
// 		$match: {
// 			gender: "Male"
// 		}
// 	}, {
// 		$project: {
// 			first_name: 1,
// 			last_name: 1,
// 			month: {
// 				$month: '$created'
// 			},
// 			gender: 1
// 		}
// 	}, {
// 		$match: {
// 			month: 5
// 		}
// 	}).exec(function(err, data) {

// 		userObj.aggregate({
// 			$match: {
// 				gender: "Female"
// 			}
// 		}, {
// 			$project: {
// 				first_name: 1,
// 				last_name: 1,
// 				month: {
// 					$month: '$created'
// 				},
// 				gender: 1
// 			}
// 		}, {
// 			$match: {
// 				month: 5
// 			}
// 		}).exec(function(err, data1) {
// 			console.log("here--", data)
// 			var outputJSON = {
// 				"status": 'success',
// 				"messageId": 200,
// 				"message": "Data retrieve successfully.",
// 				"totalmales": data.length,
// 				"totalfemales": data1.length
// 			}
// 			res.status(200).jsonp(outputJSON);
// 		});
// 	});
// }

// exports.userinjune = function(req, res) {
// 	userObj.aggregate({
// 		$match: {
// 			gender: "Male"
// 		}
// 	}, {
// 		$project: {
// 			first_name: 1,
// 			last_name: 1,
// 			month: {
// 				$month: '$created'
// 			},
// 			gender: 1
// 		}
// 	}, {
// 		$match: {
// 			month: 6
// 		}
// 	}).exec(function(err, data) {

// 		userObj.aggregate({
// 			$match: {
// 				gender: "Female"
// 			}
// 		}, {
// 			$project: {
// 				first_name: 1,
// 				last_name: 1,
// 				month: {
// 					$month: '$created'
// 				},
// 				gender: 1
// 			}
// 		}, {
// 			$match: {
// 				month: 6
// 			}
// 		}).exec(function(err, data1) {
// 			console.log("here--", data)
// 			var outputJSON = {
// 				"status": 'success',
// 				"messageId": 200,
// 				"message": "Data retrieve successfully.",
// 				"totalmales": data.length,
// 				"totalfemales": data1.length
// 			}
// 			res.status(200).jsonp(outputJSON);
// 		});
// 	});
// }

// exports.userinjuly = function(req, res) {
// 	userObj.aggregate({
// 		$match: {
// 			gender: "Male"
// 		}
// 	}, {
// 		$project: {
// 			first_name: 1,
// 			last_name: 1,
// 			month: {
// 				$month: '$created'
// 			},
// 			gender: 1
// 		}
// 	}, {
// 		$match: {
// 			month: 7
// 		}
// 	}).exec(function(err, data) {

// 		userObj.aggregate({
// 			$match: {
// 				gender: "Female"
// 			}
// 		}, {
// 			$project: {
// 				first_name: 1,
// 				last_name: 1,
// 				month: {
// 					$month: '$created'
// 				},
// 				gender: 1
// 			}
// 		}, {
// 			$match: {
// 				month: 7
// 			}
// 		}).exec(function(err, data1) {
// 			console.log("here--", data)
// 			var outputJSON = {
// 				"status": 'success',
// 				"messageId": 200,
// 				"message": "Data retrieve successfully.",
// 				"totalmales": data.length,
// 				"totalfemales": data1.length
// 			}
// 			res.status(200).jsonp(outputJSON);
// 		});
// 	});
// }

// exports.userinaug = function(req, res) {
// 	userObj.aggregate({
// 		$match: {
// 			gender: "Male"
// 		}
// 	}, {
// 		$project: {
// 			first_name: 1,
// 			last_name: 1,
// 			month: {
// 				$month: '$created'
// 			},
// 			gender: 1
// 		}
// 	}, {
// 		$match: {
// 			month: 8
// 		}
// 	}).exec(function(err, data) {

// 		userObj.aggregate({
// 			$match: {
// 				gender: "Female"
// 			}
// 		}, {
// 			$project: {
// 				first_name: 1,
// 				last_name: 1,
// 				month: {
// 					$month: '$created'
// 				},
// 				gender: 1
// 			}
// 		}, {
// 			$match: {
// 				month: 8
// 			}
// 		}).exec(function(err, data1) {
// 			console.log("here--", data)
// 			var outputJSON = {
// 				"status": 'success',
// 				"messageId": 200,
// 				"message": "Data retrieve successfully.",
// 				"totalmales": data.length,
// 				"totalfemales": data1.length
// 			}
// 			res.status(200).jsonp(outputJSON);
// 		});
// 	});
// }

// exports.userinsept = function(req, res) {
// 	userObj.aggregate({
// 		$match: {
// 			gender: "Male"
// 		}
// 	}, {
// 		$project: {
// 			first_name: 1,
// 			last_name: 1,
// 			month: {
// 				$month: '$created'
// 			},
// 			gender: 1
// 		}
// 	}, {
// 		$match: {
// 			month: 9
// 		}
// 	}).exec(function(err, data) {

// 		userObj.aggregate({
// 			$match: {
// 				gender: "Female"
// 			}
// 		}, {
// 			$project: {
// 				first_name: 1,
// 				last_name: 1,
// 				month: {
// 					$month: '$created'
// 				},
// 				gender: 1
// 			}
// 		}, {
// 			$match: {
// 				month: 9
// 			}
// 		}).exec(function(err, data1) {
// 			console.log("here--", data)
// 			var outputJSON = {
// 				"status": 'success',
// 				"messageId": 200,
// 				"message": "Data retrieve successfully.",
// 				"totalmales": data.length,
// 				"totalfemales": data1.length
// 			}
// 			res.status(200).jsonp(outputJSON);
// 		});
// 	});
// }

// exports.userinoct = function(req, res) {
// 	userObj.aggregate({
// 		$match: {
// 			gender: "Male"
// 		}
// 	}, {
// 		$project: {
// 			first_name: 1,
// 			last_name: 1,
// 			month: {
// 				$month: '$created'
// 			},
// 			gender: 1
// 		}
// 	}, {
// 		$match: {
// 			month: 10
// 		}
// 	}).exec(function(err, data) {

// 		userObj.aggregate({
// 			$match: {
// 				gender: "Female"
// 			}
// 		}, {
// 			$project: {
// 				first_name: 1,
// 				last_name: 1,
// 				month: {
// 					$month: '$created'
// 				},
// 				gender: 1
// 			}
// 		}, {
// 			$match: {
// 				month: 10
// 			}
// 		}).exec(function(err, data1) {
// 			console.log("here--", data)
// 			var outputJSON = {
// 				"status": 'success',
// 				"messageId": 200,
// 				"message": "Data retrieve successfully.",
// 				"totalmales": data.length,
// 				"totalfemales": data1.length
// 			}
// 			res.status(200).jsonp(outputJSON);
// 		});
// 	});
// }

// exports.userinnov = function(req, res) {
// 	userObj.aggregate({
// 		$match: {
// 			gender: "Male"
// 		}
// 	}, {
// 		$project: {
// 			first_name: 1,
// 			last_name: 1,
// 			month: {
// 				$month: '$created'
// 			},
// 			gender: 1
// 		}
// 	}, {
// 		$match: {
// 			month: 11
// 		}
// 	}).exec(function(err, data) {

// 		userObj.aggregate({
// 			$match: {
// 				gender: "Female"
// 			}
// 		}, {
// 			$project: {
// 				first_name: 1,
// 				last_name: 1,
// 				month: {
// 					$month: '$created'
// 				},
// 				gender: 1
// 			}
// 		}, {
// 			$match: {
// 				month: 11
// 			}
// 		}).exec(function(err, data1) {
// 			console.log("here--", data)
// 			var outputJSON = {
// 				"status": 'success',
// 				"messageId": 200,
// 				"message": "Data retrieve successfully.",
// 				"totalmales": data.length,
// 				"totalfemales": data1.length
// 			}
// 			res.status(200).jsonp(outputJSON);
// 		});
// 	});
// }

// exports.userindec = function(req, res) {
// 	userObj.aggregate({
// 		$match: {
// 			gender: "Male"
// 		}
// 	}, {
// 		$project: {
// 			first_name: 1,
// 			last_name: 1,
// 			month: {
// 				$month: '$created'
// 			},
// 			gender: 1
// 		}
// 	}, {
// 		$match: {
// 			month: 12
// 		}
// 	}).exec(function(err, data) {

// 		userObj.aggregate({
// 			$match: {
// 				gender: "Female"
// 			}
// 		}, {
// 			$project: {
// 				first_name: 1,
// 				last_name: 1,
// 				month: {
// 					$month: '$created'
// 				},
// 				gender: 1
// 			}
// 		}, {
// 			$match: {
// 				month: 12
// 			}
// 		}).exec(function(err, data1) {
// 			console.log("here--", data)
// 			var outputJSON = {
// 				"status": 'success',
// 				"messageId": 200,
// 				"message": "Data retrieve successfully.",
// 				"totalmales": data.length,
// 				"totalfemales": data1.length
// 			}
// 			res.status(200).jsonp(outputJSON);
// 		});
// 	});
// }


exports.blockUser = function(req, res) {
	console.log("req.body", req.body)
	userObj.update({
		_id: req.body._id
	}, {
		$set: {
			blocked: true,
			blocked_by : req.body.blocked_by
		}
	}, function(err, updRes) {
		if (err) {
			console.log(err);
		} else {
			userObj.findOne({
				_id: req.body._id
			}, function(err, data) {
				if (err) {
					outputJSON = {
						'status': 'failure',
						'messageId': 401,
						'message': 'Error in finding email' + err
					};
					res.jsonp(outputJSON);
				} else {
					outputJSON = {
						'status': 'success',
						'messageId': 200,
						'data': data
					};
					res.jsonp(outputJSON);
				}
			});
		}

	})
}


exports.unblockUser = function(req, res) {
	console.log("req.body", req.body)
	userObj.update({
		_id: req.body._id
	}, {
		$set: {
			blocked: false,
			blocked_by : null
		}
	}, function(err, updRes) {
		if (err) {
			console.log(err);
		} else {
			userObj.findOne({
				_id: req.body._id
			}, function(err, data) {
				if (err) {
					outputJSON = {
						'status': 'failure',
						'messageId': 401,
						'message': 'Error in finding email' + err
					};
					res.jsonp(outputJSON);
				} else {
					outputJSON = {
						'status': 'success',
						'messageId': 200,
						'data': data
					};
					res.jsonp(outputJSON);
				}
			});
		}

	})
}


exports.usersmontly = function(req, res) {

	let d = new Date();
	let date = new Date();
	date.setFullYear(date.getFullYear() - 1);
	date.setMonth(date.getMonth() + 1);
	let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
	console.log("last year", firstDay)
	userObj.aggregate([{
		$match: {
			"created": {
				$gte: new Date(firstDay),
				$lt: new Date()
			}
		}
	}, {
		$project: {
			year: {
				$year: "$created"
			},
			month: {
				$month: "$created"
			},
			day: {
				$dayOfMonth: "$created"
			},
			gender: 1
		}
	}, {
		$group: {
			_id: {
				"month": "$month",
				"gender": "$gender",
				"year": "$year"
			},
			count: {
				"$sum": 1
			}
		}
	}]).exec(function(userErr, userData) {
		console.log("userdata================", userData);
		console.log("first day",firstDay.getMonth())
		let male = [],
			female = [];

		for (var i = firstDay.getMonth() + 1; i <= 12; i++) {
			let maleCount = 0;
			let femaleCount = 0;
			for (var j = 0; j < userData.length; j++) {
				if (i == userData[j]._id.month && userData[j]._id.gender == "Male" && firstDay.getFullYear() == userData[j]._id.year) {
					male.push(userData[j].count);
					maleCount = 1
				}
				if (i == userData[j]._id.month && userData[j]._id.gender == "Female" && firstDay.getFullYear() == userData[j]._id.year) {
					female.push(userData[j].count);
					femaleCount = 1;
				}
			}
			if (maleCount == 0) {
				male.push(0);
			}
			if (femaleCount == 0) {
				female.push(0);
			}
		}
		for (var k = 1; k <= firstDay.getMonth(); k++) {
			let maleCount = 0;
			let femaleCount = 0;
			for (var j = 0; j < userData.length; j++) {
				if (k == userData[j]._id.month && userData[j]._id.gender == "Male" && d.getFullYear() == userData[j]._id.year) {
					male.push(userData[j].count);
					maleCount = 1
				}
				if (k == userData[j]._id.month && userData[j]._id.gender == "Female" && d.getFullYear() == userData[j]._id.year) {
					female.push(userData[j].count);
					femaleCount = 1;
				}
			}
			if (maleCount == 0) {
				male.push(0);
			}
			if (femaleCount == 0) {
				female.push(0);
			}
		}


		console.log("male", male);
		console.log("female",female);
		return res.status(200).send({
			"msg": "You are successfully subscribed.",
			female: female,
			male: male
		});

	})
}
