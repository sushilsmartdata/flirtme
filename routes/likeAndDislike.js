module.exports = function(app, express, passport) {
	var router = express.Router();
	var likeDislikeObj = require('./../app/controllers/likeAndDislike/likeAndDislike.js');
	router.post('/leftRightSwipe',likeDislikeObj.updateLikeCount, likeDislikeObj.leftRightSwipe);
	router.post('/findFriends',likeDislikeObj.updateUser,likeDislikeObj.findFriends);
	router.post('/matchListing', likeDislikeObj.matchListing);
	router.post('/deleteUser',likeDislikeObj.deleteUser)
	router.post('/listBlockUser',likeDislikeObj.listBlockUser);
	router.post('/dislike',likeDislikeObj.dislike);
	router.post('/userpackage',likeDislikeObj.userpackage);

	app.use('/likeDislike', router);
}

