module.exports = function(app, express, passport) {

	var router = express.Router();

	var settingObj = require('./../app/controllers/setting/setting.js');
	router.post('/findSetting',  settingObj.findSetting);
	// router.post('/saveSetting',settingObj.saveSetting);
    router.post('/updateSetting',  settingObj.updateSetting);
   // router.get('/allEucationLevel',  passport.authenticate('userBearer', {
	//	session: true
	//}),settingObj.allEucationLevel);
	app.use('/setting', router);
}

