"use strict"

angular.module("Jobs")

.factory('JobService', ['$http', 'communicationService', function($http, communicationService) {

	var service = {};

	service.totalJob = function(callback) {
		communicationService.resultViaGet(webservices.totalJob, appConstants.authorizationKey, headerConstants.json, function(response) {
			callback(response.data);
		});

	}

	service.getJobList = function(callback) {
		communicationService.resultViaGet(webservices.jobList, appConstants.authorizationKey, headerConstants.json, function(response) {
			callback(response.data);
		});

	}
	service.paymentHistory = function(callback) {
		communicationService.resultViaGet(webservices.paymentHistory, appConstants.authorizationKey, headerConstants.json, function(response) {
			callback(response.data);
		});

	}
	service.revenue = function(callback) {
		communicationService.resultViaGet(webservices.revenue, appConstants.authorizationKey, headerConstants.json, function(response) {
			callback(response.data);
		});

	}
	service.saveJob = function(inputJsonString, callback) {


		communicationService.resultViaPost(webservices.createJob, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
			callback(response.data);
		});
	}

	service.updateJob = function(inputJsonString, jobId, callback) {
		var serviceURL = webservices.updateJob + "/" + jobId;
		console.log(serviceURL);
		communicationService.resultViaPost(serviceURL, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
			callback(response.data);
		});

	}
	service.getJob = function(jobId, callback) {
		var serviceURL = webservices.findOneJob + "/" + jobId;
		communicationService.resultViaGet(serviceURL, appConstants.authorizationKey, headerConstants.json, function(response) {
			callback(response.data);
		});

	}

	service.updateJobStatus = function(inputJsonString, callback) {
		communicationService.resultViaPost(webservices.bulkUpdateJob, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) {
			callback(response.data);
		});
	}


	return service;


}]);