var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var db = require('./db.js');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var md5 = require('md5');
var session = require('express-session');

var userTokenObj = require('./app/models/users/userTokens.js');

var adminLoginObj = require('./app/models/adminlogins/adminlogin.js');
var userObj = require('./app/models/users/users.js');
var tokenService = require('./app/services/tokenAuth.js');
var constantObj = require('./constants.js');
var chsimpconstantObj = require('./chsimpconstants.js');
var chtradconstantObj = require('./chtradconstants.js');
var crypto = require('crypto');
var connect = require('connect');
var key = 'MySecretKey12345';
var iv = '1234567890123456';
var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);



/*var routes = require('./routes/index');
var users = require('./routes/users');*/

var app = express();
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json({limit: '50mb'}));

//  app.use(session({
//   secret: 'keyboard-cat',
//   cookie: { secure: true },
//   proxy: true,
//   resave: false,
//   saveUninitialized: true
// }));

 app.use(session({ 
  store: '', 
  secret: 'BBQ12345AHHH',
  cookie: {httpOnly: false},
  key: 'cookie.sid' }          
));

 app.use(session({
  genid: function(req) {
    return genuuid() // use UUIDs for session IDs 
  },
  secret: 'keyboard cat'
}))


//API Security - Browser Authentication/Basic Authentication
var users = [{username:'taxi', password:'application'}];
/*passport.use('basic',new BasicStrategy({}, function (username, password, done) {
    console.log(username, password) ; 
    findByUsername(username, function(err, user) {
      if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (user.password != password) { return done(null, false); }
          return done(null, user);
      });
  }
));*/
/*var gcm = require('android-gcm');
var apn = require("apn"), options, notification;
var path = require('path'),
    os = require('os'),fs = require('fs')
  , exec = require('child_process').exec
  , util = require('util')
  , Files = {};
  
  apnError = function(err)
  {
      console.log("APN Error:", err);
  } 
  options =
   {
      certFile: path.resolve('cert.pem'),
      keyFile: path.resolve('key.pem'),
      gateway : 'gateway.push.apple.com',
      errorCallback:apnError,
       debug : true,
       passphrase:"123456",
    };

//connection1 = new apn.Connection(options);    
 
notification = new apn.Notification();

var gcmObject = new gcm.AndroidGcm('AIzaSyC_5mrHRfwNhN-xHNJ4_tv1hXpsmPbZnss');    
      
  // create new message     
  //var message = new gcm.Message({   
  //    registration_ids: ['fo9-1Zge1KM:APA91bEQtnakBBqkvHEGCUwaMS70yqvEfTJvoVnhBG-ZnxMEf4huVQw1vLSoHfS0tBwJm_wPfTYmqCnh2E-c-YFGB-XozDqWVipU0lsmu6Nfy3Ba8pYE3RjIAM2pgmiW2qhAUgwfI_08'],   
  //    data: {   
  //    message: 'Hi Test'    
  //    }   
 // });   
  var message = new gcm.Message({
    collapseKey: 'demo',
    priority: 'high',
    contentAvailable: true,
    delayWhileIdle: true,
    timeToLive: 3,
    restrictedPackageName: "somePackageName",
    dryRun: true,
    data: {
        key1: 'message1',
        key2: 'message2'
    },
    notification: {
        title: "Hello, World",
        icon: "ic_launcher",
        body: "This is a notification that will be displayed ASAP."
    },
    registration_ids: ['fo9-1Zge1KM:APA91bEQtnakBBqkvHEGCUwaMS70yqvEfTJvoVnhBG-ZnxMEf4huVQw1vLSoHfS0tBwJm_wPfTYmqCnh2E-c-YFGB-XozDqWVipU0lsmu6Nfy3Ba8pYE3RjIAM2pgmiW2qhAUgwfI_08']   
      
});   
  // send the message     
  gcmObject.send(message, function(err, response) {   
      if (err) {    
    console.log(err);   
      }   
      console.log("response");
      console.log(response);
           
      if (response.success==1) {    
    console.log(response.results[0].message_id);    
      }   
          
          
      });*/ 
passport.use('bearer', new BearerStrategy(function(token, done) {
  //console.log("HERE IN THE CODE");
  tokenService.verifyToken(token, function(e, s) {
  if (e) {
  return done(e);
  }
  //console.log(e, s.sid)
  userTokenObj.findOne({
      token: token
    })
    .populate('admin')
    .populate('user')
    .exec(function(err, user) {
      //console.log("User is ", JSON.stringify(user));
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }

      if(user.admin==undefined){
        return done(null, user.user, {
          scope: 'all'
        });
      }
        return done(null, user.admin, {
          scope: 'all'
        });
  
     

    });
   });
}));





function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}


//admin login
var LocalStrategy = require('passport-local').Strategy;

  passport.use('adminLogin',new LocalStrategy(
    function(username, password, done) {
      console.log(username);
      adminLoginObj.findOne({username: username}, function(err, adminuser) {
       
        if(err) {
               return done(err);
        }
        
        if(!adminuser) {
           console.log("in adminuser");
          return done(null, false);
        }

        var key = 'MySecretKey12345';
        var iv = '1234567890123456';
        var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
       var encrypted = cipher.update(password, 'utf8', 'binary');
        encrypted += cipher.final('binary');
        hexVal = new Buffer(encrypted, 'binary');
        newEncrypted = hexVal.toString('hex');
        console.log("decipherPassword ",newEncrypted);
        password=newEncrypted;
        
        if(adminuser.password != password) {
              return done(null, false);
        }


        //returning specific data
        
        //generate a token here and return 
        var authToken = tokenService.issueToken({sid: adminuser});
        // save token to db  ; 
        var tokenObj = new userTokenObj({"admin":adminuser._id,"token": authToken});

        tokenObj.save(function(e,s){});
        // console.log("Type is " , adminuser.type);
        //return permission from here .
        return done(null, {id: adminuser._id,username:adminuser.username,firstname:adminuser.firstname,lastname:adminuser.lastname,token: authToken,image:adminuser.prof_image });

          



      });
    }
  ));

passport.serializeUser(adminLoginObj.serializeUser);
passport.deserializeUser(adminLoginObj.deserializeUser);

var LocalStrategy = require('passport-local').Strategy;

  passport.use('users',new LocalStrategy(
    function(username, password, done) {

      //console.log(username,"pas",password)
        //var provider=['@facebook','@gmail','@twitter','@linkedIn'];
       // console.log('username ',username ,'password ',password,' ',provider.indexOf(password),"device ",device_id);
       password=md5(password);
       console.log(password)
      var search={$or : [  { phone :username } ],password:password,isDeleted:false};
      
      console.log('search ',search )
      userObj.findOne(search, function(err, user) {
        //console.log(user);
        if(err) {
               return done(err);
        }
        
        if(!user) {
           console.log("in user");
          return done(null, {error: true});
        }
        // if(user.status==false){
        //   return done(null, {error: 'Invalid user'});
        //  //generate a token here and return 
        // }
        var authToken = tokenService.issueToken({sid: user});
        // save token to db  ; 
        //console.log(authToken)
        var tokenObj = new userTokenObj({"user":user._id,"token": authToken});

        tokenObj.save(function(e,s){});
        userObj.update(search,{$set:{"logged_status":true}}, function(err, user) {
          if(err)
            console.log("loging err",err);
        })

        // console.log("Type is " , adminuser.type);
        //return permission from here .
        return done(null, {id: user._id,username:user.email,token: authToken});
          //return done(null, { user: user,token: authToken });
         
      });
    }
  ));

passport.serializeUser(userObj.serializeUser);
passport.deserializeUser(userObj.deserializeUser);



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




/*app.use('/', routes);
app.use('/users', users);*/

require('./routes/adminlogin')(app, express, passport);
require('./routes/users')(app, express, passport);
require('./routes/likeAndDislike')(app, express,passport);
require('./routes/setting')(app, express,passport);
require('./routes/help')(app, express,passport);
require('./routes/packages')(app, express,passport);
require('./routes/reports')(app, express,passport);
//require('./routes/messages')(app, express, passport);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


var decrypted = decipher.update('14a0f68f2312944a57fdd20704ad9f72', 'hex', 'binary');
          decrypted += decipher.final('binary');

        console.log('Decrypted: ', decrypted);
        
module.exports = app;

