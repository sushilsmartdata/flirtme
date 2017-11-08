module.exports = function(app, express, passport) {

	var router = express.Router();

	var reportObj = require('./../app/controllers/reports/reports.js');
	router.post('/add',reportObj.add);
	// router.post('/saveSetting',settingObj.saveSetting);
    //router.post('/updateSetting',  settingObj.updateSetting);
    router.get('/list',  reportObj.list);
	app.use('/report', router);
}

