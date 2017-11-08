"use strict";

angular.module("Home")

flirtme.controller("homeController", ['$stateParams', '$state', '$scope', '$rootScope', '$localStorage', 'UserService', function($stateParams, $state, $scope, $rootScope, $localStorage, UserService) {

	if ($localStorage.userLoggedIn) {
		$rootScope.userLoggedIn = true;
		$rootScope.loggedInUser = $localStorage.loggedInUsername;
		$rootScope.displayImage = $localStorage.displayImage;
	} else {
		$rootScope.userLoggedIn = false;
	}

	$rootScope.sideBar = "home";
	$scope.totalUser = 0;
	$scope.totalJob = 0;
	$scope.loader = true;
	$scope.reports = 0;


	UserService.usersreport(function(response) {
		console.log("gbxdggxdgh", response.data.friends);
		$scope.reports = response.data.friends.length;
		// toastr.success('Data Saved Successfully.');
	})


	UserService.totalUser(function(response) {

		$scope.loader = false;
		if (response.messageId == 200) {

			$scope.totalUser = response.data;
			console.log("$scope.totalUser", $scope.totalUser)

		}
	});
	$scope.user = 70


	// UserService.userAllJobs(1,0,5,function(response) {
	//    			if(response.messageId == 200) {
	//    				$scope.latestJob=response.data;
	//    			}
	//    			});

	UserService.latestUser(function(response) {
		if (response.messageId == 200) {


			$scope.latestUser = response.data;
			for (var i = 0; i < $scope.latestUser.length; i++) {
				if ($scope.latestUser[i].userImages.length > 0) {

					$scope.latestUser[i].profile_image = $scope.latestUser[i].userImages[0].name;


				}
			}

			//console.log($scope.latestUser[0].userImages)



		}
	});
	$scope.date = new Date();
	$scope.yesterday = new Date();
	$scope.yesterday.setDate($scope.yesterday.getDate() - 1);


	UserService.monthwiseData(function(response) {
		console.log("monthwise data", response)
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
			"July", "Aug", "Sept", "Oct", "Nov", "Dec"
		];
		var d = new Date();
		var date = new Date();
		date.setFullYear(date.getFullYear() - 1);
		date.setMonth(date.getMonth() + 1);
		var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		var month = [];
		for (var i = firstDay.getMonth(); i < 12; i++) {
			month.push(i);
		}
		for (var j = 0; j < firstDay.getMonth(); j++) {
			month.push(j)
		}
		console.log("month", month)
		Highcharts.chart('container', {
			title: {
				text: 'Users',
				style: {
					"color": '#000000',
					"fontName": 'Verdana,Arial,Helvetica,sans-serif',
					"fontSize": "14px",
					"fontWeight": "bold"
				},
				x: -10 //cente
			},
			//type: 'line'
			xAxis: {
				labels: {
					style: {
						"fontName": 'Verdana,Arial,Helvetica,sans-serif',
						"fontWeight": "bold"
					}
				},
				title: {
					text: 'Months',
					style: {
						"color": '#109618',
						"fontName": 'Verdana,Arial,Helvetica,sans-serif',
						"fontSize": "14px",
						"fontWeight": "bold"
					}
				},
				categories: [monthNames[month[0]], monthNames[month[1]], monthNames[month[2]], monthNames[month[3]], monthNames[month[4]], monthNames[month[5]], monthNames[month[6]], monthNames[month[7]], monthNames[month[8]], monthNames[month[9]], monthNames[month[10]], monthNames[month[11]]]
			},
			yAxis: { //max: 100,
				labels: {
					formatter: function() {
						return this.value;
					},
					style: {
						"fontName": 'Verdana,Arial,Helvetica,sans-serif',
						"fontWeight": "bold"
					}
				},
				title: {
					text: 'Counts',
					style: {
						"color": '#109618',
						"fontName": 'Verdana,Arial,Helvetica,sans-serif',
						"fontSize": "14px",
						"fontWeight": "bold"
					}
				},
				plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				}]
			},
			tooltip: {
				valuePrefix: '',
			},
			colors: ['#F39C12', '#00A65A'],
			credits: {
				text: ''
			},

			series: [{
				type: 'column',
				name: 'Male',
				data: [response.data.male[0], response.data.male[1], response.data.male[2], response.data.male[3], response.data.male[4], response.data.male[5], response.data.male[6], response.data.male[7], response.data.male[8], response.data.male[9], response.data.male[10], response.data.male[11]]
			}, {
				type: 'column',
				name: 'Female',
				data: [response.data.female[0], response.data.female[1], response.data.female[2], response.data.female[3], response.data.female[4], response.data.female[5], response.data.female[6], response.data.female[7], response.data.female[8], response.data.female[9], response.data.female[10], response.data.female[11]]
			}]
		});

	});



}]);
