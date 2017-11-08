'use strict'

angular.module('helpBlock')

.factory('helpService', ['communicationService', '$rootScope', 
	function(communicationService, $rootScope) {
	var service = {};
	service.updateHelpBlock = function(inputJsonString, callback) { 
			communicationService.resultViaPost(webservices.updateHelpBlock, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
			callback(response.data);
		});	
	};

	service.getHelpBlockListing = function(callback) {
			communicationService.resultViaGet(webservices.getHelpBlockListing, appConstants.authorizationKey, headerConstants.json, function(response) {
			callback(response.data);
		});
	}

	service.usersreport = function(callback) {
			communicationService.resultViaGet(webservices.usersreport, appConstants.authorizationKey, headerConstants.json, function(response) {
			callback(response);
		});
	}

	service.unblockuser = function(inputJsonString,callback) {
			communicationService.resultViaPost(webservices.unblockuser, appConstants.authorizationKey, headerConstants.json,inputJsonString, function(response) {
			callback(response);
		});
	}

	service.blockuser = function(inputJsonString,callback) {
			communicationService.resultViaPost(webservices.blockuser, appConstants.authorizationKey, headerConstants.json, inputJsonString,function(response) {
			callback(response);
		});
	}

	service.getHelpInformation = function(inputJsonString, callback) { 
			communicationService.resultViaPost(webservices.getHelpInformation, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
			callback(response.data);
		});	
	};

	service.insertHelpInformation = function(inputJsonString, callback) { 
			communicationService.resultViaPost(webservices.insertHelpInformation, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
			callback(response.data);
		});	
	};

	service.deleteHelp = function(inputJsonString, callback) { 
			communicationService.resultViaPost(webservices.deleteHelp, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
			callback(response.data);
		});	
	};

     return service;
}])
