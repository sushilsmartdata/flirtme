var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;
var userSchema = new Schema({
  //username: {type: String},
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  // email:{
  //   type:String,
  //   unique : true,
  //   sparse: true
  // },
  location: {
    type: String
  },
  socketid: {
    type: String
  },
  last_seen: {
    type: Date,
    default: Date.now
  },

  // quickBloxUniqueId:{
  //   type:String
  // },
  gender: {
    type: String
  },
  blocked : {
    type: Boolean
  },
  blocked_by: {
    type:Schema.Types.ObjectId
  },
  resetrandom: {
    type: String
  },
  distance: {
    type: String
  },
  dob: {
    type: Date
  },
  contact: {
    type: Number
  },
  password: {
    type: String
  },
  // profile_image:{
  //   type:String
  // },
  zipCode: {
    type: String
  },
  user_type: {
    type: {
      type: String,
      default: "Web"
    }
  },
  device_type: {
    type: String
  },
  device_token: {
    type: String
  },
  userImages: [{
    name: {
      type: String
    },
    thumbnail: {
      type: String
    },
    duration: {
      type: String
    },
    creationDate: {
      type: Date,
      default: Date.now()
    }
  }],
  _public: {
    type: Boolean,
    default: true
  },
  facebook_id: {
    type: String
  },
  latLong: {
    type: [Number],
    index: '2dsphere'
  },
  education: {
    type: String
  },
  about_me: {
    type: String
  },
  college_name: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isLike: {
    type: Boolean,
    default: false
  },
  profession: {
    type: String
  },
  subScribeNewsLetter: {
    type: Boolean,
    default: true
  },
  created: {
    type: Date,
    default: Date.now()
  },
  modified: {
    type: Date
  },
  phone: {
    type: String,
    unique: true,
    sparse: true
  },
  otp: String,
  likesCount: {
    type: Number,
    default: 5
  },
  likesleft: {
    type: Number,
    default: 50
  },
  package: {
    type: Number,
    default: 0
  },
  subscription_notification: {
    type: Number,
    default: 0
  },
  badge_count: {
    type: Number,
    default: 0
  },
  package_date: {
    type: Date,
    default: Date.now()
  },
  logged_status: {
    type: Boolean,
    default: false
  },
  // socketid:{type:String} ,
  enable: {
    type: Boolean,
    default: true
  },
  status: {
    type: Boolean,
    default: false
  },
}, {
  collection: 'users'
});


//custom validations

// userSchema.path('username').validate(function(value) {
//   var validateExpression = /^[a-z0-9]{3,15}$/;
//   return validateExpression.test(value);
// }, ",Please enter a valid user name.");


// userSchema.path("last_name").validate(function(value) {
//   var validateExpression = /^[ A-Za-z']*$/;
//   return validateExpression.test(value);
// }, ",Please enter a valid last name.");

// userSchema.path("email").validate(function(value) {
//   var validateExpression = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
//   return validateExpression.test(value);
// }, ",Please enter a valid email address.");

/*userSchema.plugin(uniqueValidator, {
  //message: "Username/email already exists."
  message: " already exists."
});*/
userSchema.statics.serializeUser = function(user, done) {
  //console.log("serializeUser");
  done(null, user);
};

userSchema.statics.deserializeUser = function(obj, done) {
  //console.log("deserializeUser");
  done(null, obj);
};



var userObj = mongoose.model('users', userSchema);
module.exports = userObj;
