var reportObj = require('./../../models/reports/reports.js');
var userObj = require('./../../models/users/users.js');
var constantObj = require('./../../../constants.js');
// var chsimpconstantObj = require('./../../../chsimpconstants.js');
// var chtradconstantObj = require('./../../../chtradconstants.js');


exports.add = function(req, res) {
	var saveData = JSON.parse(JSON.stringify(req.body));

	console.log("....----", req.body)

	reportObj(saveData).save(saveData, function(err, data) {
		if (err) {
			outputJSON = {
				'status': 'failure',
				'messageId': 401,
				'message': err
			};
			res.status(200).jsonp(outputJSON)
		} else {
			outputJSON = {
				'status': 'success',
				'messageId': 200,
				'message': "Report has been added successfully."
			};

			res.status(200).jsonp(outputJSON)

		}
	})

}

exports.list = function(req, res) {
	reportObj.find({}).exec(function(err, data) {
		if (err) {
			var response = {
				"status": 'failure',
				"messageId": 401,
				"message": "Sorry problem to get data .",
				"data": data
			};
			res.status(401).jsonp(response);
		} else {
			reportObj.aggregate([{
				$lookup: {
					from: "users",
					localField: "user_id",
					foreignField: "_id",
					as: "users"
				}
			}, {
				$lookup: {
					from: "users",
					localField: "friend_id",
					foreignField: "_id",
					as: "friends"
				}
			}]).exec(function(err, data1) {
				var response = {
					"status": 'success',
					"messageId": 200,
					"message": "Data retrieve successfully.",
					"data": data,
					"friends" : data1
				};
				res.status(200).jsonp(response);
			});

		}
	})
}