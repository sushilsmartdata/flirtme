var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reportSchema = new Schema({
	user_id:{
		type:Schema.Types.ObjectId,
		ref:'users'
	},
	descrption:{
		type:String	
	},
	friend_id:{
		type:Schema.Types.ObjectId
	}
});
var adminlogin = mongoose.model('reports', reportSchema);
module.exports = adminlogin;