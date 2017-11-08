var userObj = require('./../app/models/users/users.js');
var gcm = require('android-gcm');
var apn = require("apn");
var path = require('path');

var geocoder = require('geocoder');
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

var options;
var notification;
var apiKey = 'AAAARK_xZm0:APA91bE1ENpLjA5_FdXv3KSwaZCyLh5WQjAM_n_pZAkXwbA3tVNMg0QTbJoya9KKiw7UAvwtXBQolfZo7ShH7eEB5fXpCsmnJFI1hMa0H2-QqfAlpdgqO3HlEfmlpGvnbyLqrR-BnErk';
var options = {
  token: {
    key: path.resolve("./common/AuthKey_72EB7MD5TX.p8"),
   // cert: path.resolve('./common/FlirtMe.pem'),
    keyId: "72EB7MD5TX",
    teamId: "GW3MK2927A"
  },
  production: true
};

note = new apn.Notification();

exports.pushRequest = function(body,headers,cb) {

    console.log("req.body is pushRequest",body);
    
    userObj.findOne({
        _id: body.to
    }, function(userErr, userDetail) {
        // console.log("userdetail",userDetail)
        if (userErr) {
            res.jsonp({
                'status': 'faliure',
                'messageId': 401,
                'message': 'There is problem in sending push notification when getting source name',
                "userdata": userErr
            });
        } else {
            console.log("userDetail",userDetail);
             if (userDetail.device_type == 'ios') {
                 pushSendToIOS(body, userDetail.device_token,userDetail.badge_count, function (resErr, resSuccess) {
                    if(resErr)
                    {
                        console.log("error",resErr)
                    }
                    if(resSuccess) {
                         cb(null, resSuccess);
                    }
                });
                // pushSendToIOS(body,userDetail.device_token);
                // cb(null,"Notification send For IOs")
               
            }
            if (userDetail.device_type == 'android') {
                pushSendToAndroid(body,userDetail.device_token,userDetail.badge_count, function (resErr, resSuccess) {
                    console.log("==========",resSuccess)
                    if(resErr)
                    {
                        console.log("error",resErr)
                    }
                    if(resSuccess) {

                         cb(null, resSuccess);
                    }
                });
            }
           
        }
    });

}

var pushSendToIOS = function(bodyData,token,batch,cBack) {   
    
    var apnProvider = new apn.Provider(options);
    let deviceToken = token;
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = batch;
    note.sound = "default";
    note.alert = bodyData.message;
    note.payload = {
        'messageFrom':bodyData.name,
        'notifyType' : bodyData.type,
        'fromUser' : bodyData.from,
        'badge' : batch
    };  
    note.topic = "com.jlcreations.flirtme";
    console.log("deviceToken",deviceToken)
    apnProvider.send(note, deviceToken).then((result) => {
        console.log("result is", JSON.stringify(result));
        if(result.failed.length>0){
            console.log("error in sending notification");
        }
        else{
            console.log("success in sending notification");
            cBack(null,note)
        }
    }); 
    
}


var pushSendToAndroid = function(bodyData,androidToken,batch,cBack) {
    var gcmObject = new gcm.AndroidGcm(apiKey);
    console.log("badge here...............",bodyData,androidToken,batch);
    var message = new gcm.Message({
    registration_ids: [androidToken],
    data: {
        'notifyType' : bodyData.type,
        'fromUser' : bodyData.from,
        'badge' : batch,
        'message' : bodyData.message
    }
});
console.log("message",message)
gcmObject.send(message, function(err, response) {
    console.log("resP",response)
    cBack(null,response)
});

}
exports.getLatLon = function(zipcode) {
    var result = {};
    geocoder.geocode(zipcode, function(err, data) {
        if (err) {
            // return 0;
            console.log('geolocation error : ' + err);
        } else {

            if (data.status == 'OK') {
                result.lat = data.results[0].geometry.location.lat;
                result.lng = data.results[0].geometry.location.lng;
                result.status = data.status;

                return result;
                //res.send(result);

            } else {

                result.status = data.status;
                return result;
                //res.send(result);
            }
        }
    });
}

exports.encrypt = function(text) {

    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

exports.decrypt = function(text) {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

//var hw = encrypt("hello world")
// outputs hello world
//console.log(decrypt(hw));


// exports.makeotp = function() {
//     var text = "";
//     var possible = "0123456789";

//     for (var i = 0; i < 4; i++)
//         text += possible.charAt(Math.floor(Math.random() * possible.length));

//     return text;
// }


exports.makeid = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 15; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
