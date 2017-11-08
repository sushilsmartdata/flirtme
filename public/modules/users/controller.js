"use strict";

angular.module("Users", ['oitozero.ngSweetAlert'])
flirtme.controller("userController", ['$http', '$stateParams', '$state', '$scope', '$rootScope', '$localStorage', 'UserService', 'ngTableParams', '$route', '$location', '$timeout', 'SweetAlert', '$filter', 'toastr', function($http, $stateParams, $state, $scope, $rootScope, $localStorage, UserService, ngTableParams, $route, $location, $timeout, SweetAlert, $filter, toastr) {
	if ($localStorage.userLoggedIn) {
		$rootScope.userLoggedIn = true;
		$rootScope.loggedInUser = $localStorage.loggedInUsername;
		$rootScope.displayImage = $localStorage.displayImage;
	} else {
		$rootScope.userLoggedIn = false;
	}

	$rootScope.sideBar = "users";
	var currentDate = new Date();
	var currentdate = new Date()
	currentDate.setYear(currentDate.getFullYear() - 18);
	currentdate.setYear(currentdate.getFullYear() - 100);
	var dateMinusEithteen = new Date(currentDate);
	var dateMinusHundred = new Date(currentdate)
	$scope.updateButton = false;
	$scope.submitButton = true;
	$scope.showImage = false;
	$scope.message = "";
	$scope.activeTab = 0;
	$scope.confirm_password_error = false;
	$scope.addressValid = false;
	$scope.user = {}
	$scope.selection = [];
	$scope.selectionAll;
	$scope.$on('gmPlacesAutocomplete::placeChanged', function() {

		var location = $scope.user.location.getPlace().geometry.location;
		var zip = $scope.user.location.getPlace();
		$scope.user.location = zip.formatted_address
		var postal_code = 0;
		for (var i = 0; i < zip.address_components.length; i++) {
			if (zip.address_components[i].types == "postal_code") {
				postal_code = zip.address_components[i].short_name;

			}
		}
		$scope.user.address = zip.formatted_address;
		var location = zip.geometry.location;
		$scope.user.lat = location.lat();
		$scope.user.lng = location.lng();


		if (postal_code) {
			$scope.addressValid = false;
			$scope.user.zipCode = postal_code;
		} else {
			$scope.addressValid = true;
			$scope.user.zipCode = "";
		}
		$scope.$apply();
	});

	$scope.today = function() {
		$scope.user.dob = dateMinusEithteen;
	};
	$scope.today();

	$scope.clear = function() {
		$scope.user.dob = null;
	};

	$scope.inlineOptions = {
		customClass: getDayClass,
		minDate: new Date(),
		showWeeks: true
	};

	$scope.dateOptions = {
		formatYear: 'yy',
		maxDate: dateMinusEithteen,
		minDate: new Date(),
		startingDay: 1
	};

	$scope.toggleMin = function() {
		$scope.inlineOptions.minDate = dateMinusHundred;
		$scope.dateOptions.minDate = $scope.inlineOptions.minDate;
	};

	$scope.toggleMin();

	$scope.open1 = function() {
		$scope.popup1.opened = true;
	};

	$scope.setDate = function(year, month, day) {
		$scope.user.dob = new Date(year, month, day);
	};

	$scope.altInputFormats = ['M!/d!/yyyy'];

	$scope.popup1 = {
		opened: false
	};

	$scope.downloadCSV = function() {
		UserService.exportUserList(function(response) {
			$scope.showloader = false;
			if (response.messageId == 200) {
				window.open('/assets/csv/userlist.csv');
			}
		});
	}

	$scope.emailval = "test";


	$scope.applyGlobalSearch = function() {

		var term = $scope.globalSearchTerm;
		if (term != "") {
			if ($scope.isInvertedSearch) {
				term = "!" + term;
			}
			$scope.simpleList = $filter('filter')($scope.simpleList2, term);
			$scope.tableParams.filter({
				$: term
			});
			$scope.tableParams.reload();
			$scope.selection = [];
			$scope.checkboxes.items = [];
			var myEl = angular.element(document.getElementsByClassName("select-all"));
			myEl.attr('checked', false);
			$scope.simpleList

		}
	}
	$scope.selection = [];
	$scope.selectionAll;
	$scope.selectionSkillAll = false;

	$scope.toggleSelection = function toggleSelection(id) {
		//Check for single checkbox selection
		if (id) {
			var idx = $scope.selection.indexOf(id);
			// is currently selected
			if (idx > -1) {
				$scope.selection.splice(idx, 1);
			}
			// is newly selected
			else {
				$scope.selection.push(id);
				$scope.selectionAll = true;
			}
			var myEl = angular.element(document.getElementsByClassName("select-all"));

			var myEl1 = angular.element(document.getElementsByClassName("list" + $scope.tableParams.page()));
			//alert(myEl1.length)
			var ln = 0;
			for (var i = 0; i < myEl1.length; i++) {
				if (myEl1[i].checked)
					ln++
					if (ln == myEl1.length) {
						myEl.attr('checked', true);
					} else {
						myEl.attr('checked', false);
					}
			}

		}
		//Check for all checkbox selection
		else {
			var myEl = angular.element(document.getElementsByClassName("select-all"));
			//  alert(myEl.attr('checked'))
			if (myEl.attr('checked') == undefined) {

				var i = 0;
				angular.forEach($scope.tableParams.data, function(item) {
					var idx = $scope.selection.indexOf(item._id);
					// is currently selected

					$scope.checkboxes.items[item._id] = false;
					if (idx > -1) {
						$scope.selection.splice(idx, 1);
						//alert(i)
						i++;
					}
				});

				$scope.selectionAll = false;
			}
			//Check for all un checked checkbox for check
			else {
				$scope.selectionAll = true
				if ($scope.selection.length == 0)
					$scope.selection = [];

				var i = 0;
				angular.forEach($scope.tableParams.data, function(item) {
					var idx = $scope.selection.indexOf(item._id);
					// is currently selected
					//alert(item._id)
					$scope.checkboxes.items[item._id] = $scope.checkboxes.checked;
					if (idx == -1) {
						$scope.selection.push(item._id);
						i++;
					}
				});

			}

		}
	};



	function getDayClass(data) {
		var date = data.date,
			mode = data.mode;
		if (mode === 'day') {
			var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

			for (var i = 0; i < $scope.events.length; i++) {
				var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

				if (dayToCheck === currentDay) {
					return $scope.events[i].status;
				}
			}
		}

		return '';
	}



	$scope.submit = function() {
		$scope.loader = true;
		$scope.visible = true;
		if (typeof $scope.user.profile_image == 'object') {
			$scope.user.profile_image = $scope.myCroppedIconImage;
		}
		$scope.user.phone = "+1" + $scope.user.phone
		$scope.user.latLong = [$scope.user.lng, $scope.user.lat];
		UserService.saveUser($scope.user, function(response) {
			if (response.messageId == 401) {
				$scope.emailValid = response.message;
			}
			if (response.messageId == 200) {
				// $scope.message = response.message;
				$scope.showmessage = true;
				$scope.alerttype = 'alert alert-success';
				setTimeout(function() {
					$scope.showmessage = false;
					$state.go("/users");
					$scope.loader = false;
					toastr.success(response.message);
				}, 2000);

			}
		})

	}
	

	$scope.resetPassword = function() {

		$scope.reset.email = $stateParams.email;
		$scope.reset.randomcode = $stateParams.id;
		UserService.resetPassword($scope.reset, function(response) {

			if (response.messageId == 200) {

				$scope.messageSucess = response.message;
				$timeout(function() {
					$scope.messageSucess = false;
					$route.reload();
				}, 2500);

			} else {
				$scope.messageError = response.message;
				$timeout(function() {
					$scope.messageError = false;
					$route.reload();
				}, 2500);
			}

		});
	}

	$scope.getAllUsers = function() {
		$scope.loader = true;
		var passingDate = {};
		// usSpinnerService.spin('spinner-1');
		passingDate.search = $scope.search;
		$scope.tableParams = new ngTableParams({
			page: 1,
			count: 10,
			sorting: {
				created: "desc"
			}
		}, {
			counts: [],
			getData: function($defer, params) {
				passingDate.page = params.page();
				passingDate.count = params.count();
				passingDate.sort = params.sorting();
				// usSpinnerService.stop('spinner-1');
				UserService.getUserList(passingDate, function(response) {
					$scope.loader = false;
					if (response.count == 0) {
						$scope.showStatus = true;
					} else {
						$scope.showStatus = false;
					}
					params.total(response.count);
					$scope.data = response.data;
					$scope.simpleList = response.data;
					$scope.simpleList2 = response.data;
					$defer.resolve($scope.data);
					$scope.checkboxes = {
						checked: false,
						items: {}
					};
				})
			}
		})
	}

	if ($stateParams.id) {
		$scope.updateButton = true;
		$scope.submitButton = false;
		var inputJSon = {
			_id: $stateParams.id
		}
		UserService.getCurrentUserData(inputJSon, function(response) {
			console.log("--------------",response)
			$scope.user = response.data;
			$scope.imagepath = response.imagesPath;
			if ($scope.user.phone != undefined) {
				$scope.user.phone = $scope.user.phone.replace("+1", "");


			}
			//$scope.user.phone = $scope.user.phone.replace("+1", "");
			$scope.user.dob = new Date(response.data.dob);

			if (response.data.userImages != "") {
				$scope.user.profile_image = response.data.userImages[0].name;

			}
			if (response.data.userImages.length > 0) {
				$scope.showImage = true;
			}
		})
	}


	$scope.delete = function(id) {

		SweetAlert.swal({
				title: "Are you sure?",
				text: "You will not be able to see this page!",
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Yes, delete it!",
				cancelButtonText: "No, cancel please!",
				closeOnConfirm: false,
				closeOnCancel: false
			},
			function(isConfirm) {
				if (isConfirm) {
					var inputJSon = {
						_id: id
					};
					UserService.deleteUser(inputJSon, function(response) {
						//toastr.success('Deleted.');
						$scope.getAllUsers();
					})
					SweetAlert.swal("Deleted!", "Your  file has been deleted.", "success");
				} else {
					SweetAlert.swal("Cancelled", "Your page  is safe :)", "error");
				}
			});

	}


	$scope.performAction = function(id, action) {

		var actionsArr = ["enable", "disable", "delete"];
		$scope.selectedAction = selectedAction.value;
		if (id != undefined && action != undefined) {
			$scope.selection.push(id);
			$scope.selectedAction = action;

		}
		if ($scope.selection.length == 0) {
			SweetAlert.swal("Error!", "Please check atleast one user", "error");

			return false;
		}
		if ($scope.selectedAction == 0) {

			SweetAlert.swal("Error!", "Please select action", "error");
			return false;
		}

		var skillLength = $scope.selection.length;
		var updatedData = [];
		if ($scope.selectedAction == 0)
			$scope.message = messagesConstants.selectAction;
		else {
			for (var i = 0; i < skillLength; i++) {
				var id = $scope.selection[i];
				if ($scope.selectedAction == 3) {
					updatedData.push({
						id: id,
						isDeleted: true
					});
				} else if ($scope.selectedAction == 1) {
					updatedData.push({
						id: id,
						enable: true
					});
				} else if ($scope.selectedAction == 2) {
					updatedData.push({
						id: id,
						enable: false
					});
				}
			}

			SweetAlert.swal({
					title: "",
					text: "Are you sure you want to " + actionsArr[$scope.selectedAction - 1] + "?",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#3c8dbc",
					confirmButtonText: actionsArr[$scope.selectedAction - 1].charAt(0).toUpperCase() + actionsArr[$scope.selectedAction - 1].substring(1),
					cancelButtonText: "Cancel",
					closeOnConfirm: true,
					closeOnCancel: true,
					allowOutsideClick: false
				},
				function(isConfirm) {
					if (isConfirm) {
						var inputJson = {
							data: updatedData
						}
						UserService.updateUserStatus(inputJson, function(response) {
							$scope.getAllUsers();
							selectedAction.value = 0;
							$scope.selection = [];
							$scope.showmessage = true;
							$scope.alerttype = 'alert alert-success';
							$scope.message = "User(s) " + actionsArr[$scope.selectedAction - 1] + "d successfully.";
							$timeout(function(argument) {
								$scope.showmessage = false;

							}, 2000)
						});
					}
				});
		}
	}

	$scope.performAction1 = function(id, action) {

		var actionsArr = ["enable", "disable", "delete", "approve"];
		$scope.selectedAction = selectedAction.value;
		$scope.selection = [id];
		$scope.selectedAction = action;
		if ($scope.selection.length == 0) {
			SweetAlert.swal("Error!", "Please check atleast one user", "error");
			return false;
		}
		if ($scope.selectedAction == 0) {
			SweetAlert.swal("Error!", "Please select action", "error");
			return false;
		}

		var skillLength = $scope.selection.length;
		var updatedData = [];

		if ($scope.selectedAction == 0)
			$scope.message = messagesConstants.selectAction;
		else {
			for (var i = 0; i < skillLength; i++) {
				var id = $scope.selection[i];
				if ($scope.selectedAction == 3) {
					updatedData.push({
						id: id,
						isDeleted: true
					});
				} else if ($scope.selectedAction == 1) {
					updatedData.push({
						id: id,
						enable: true
					});
				} else if ($scope.selectedAction == 2) {
					updatedData.push({
						id: id,
						enable: false
					});
				} else if ($scope.selectedAction == 4) {
					updatedData.push({
						id: id,
						status: true
					});
				}
			}


			SweetAlert.swal({
					title: "",
					text: "Are you sure you want to " + actionsArr[$scope.selectedAction - 1] + "?",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#3c8dbc",
					confirmButtonText: actionsArr[$scope.selectedAction - 1].charAt(0).toUpperCase() + actionsArr[$scope.selectedAction - 1].substring(1),
					cancelButtonText: "Cancel",
					closeOnConfirm: true,
					closeOnCancel: true,
					allowOutsideClick: false
				},
				function(isConfirm) {

					if (isConfirm) {
						var inputJson = {
							data: updatedData
						}
						if ($scope.selectedAction == 4) {
							UserService.approveUserStatus(inputJson, function(response) {
								$scope.getAllUsers();
								$scope.selection = [];
								$scope.showmessage = true;
								$scope.alerttype = 'alert alert-success';
								$scope.message = "User " + actionsArr[$scope.selectedAction - 1] + "d successfully.";
								$timeout(function(argument) {
									$scope.showmessage = false;

								}, 2000)
							});
						} else {
							UserService.updateUserStatus(inputJson, function(response) {
								$scope.getAllUsers();
								$scope.selection = [];
								$scope.showmessage = true;
								$scope.alerttype = 'alert alert-success';
								$scope.message = "User " + actionsArr[$scope.selectedAction - 1] + "d successfully.";
								$timeout(function(argument) {
									$scope.showmessage = false;

								}, 2000)
							});
						}
					}
				});
		}
	}
	$scope.myIconImage = '';
	$scope.myCroppedIconImage = '';

	var handleFileSelect2 = function(evt) {
		var file = evt.currentTarget.files[0];
		var reader = new FileReader();
		reader.onload = function(evt) {
			$scope.$apply(function($scope) {
				$scope.myIconImage = evt.target.result;
			});
		};
		reader.readAsDataURL(file);
		$scope.cropArea = false;
		$scope.cropArea2 = true;
	};

	angular.element(document.querySelector('#fileInput2')).on('change', handleFileSelect2);

	$scope.imageIconError = "";
	$scope.myCroppedIconImage = '';
	$scope.onSelectIconImg = function() {

		var allowedext = ['jpg', 'jpeg', 'gif', 'png'];
		var extn = $scope.user.profile_image.filename.split(".").pop();
		if (allowedext.indexOf(extn) > -1 && $scope.user.profile_image.filesize <= 2000000) {
			$scope.user.profile_image = "data:image/jpeg;base64," + $scope.user.profile_image.base64;
			$scope.imageIconError = "";
		} else {
			if (allowedext.indexOf(extn) == -1) {
				$scope.imageIconError = 'Please select valid file.';
				$scope.skill.icon_image = "";
				$scope.skill.iconimage = "";
				$scope.user.profile_image = "";
				$scope.myIconImage = "";

			} else
			if ($scope.skill.profile_image.filesize > 2000000) {
				$scope.imageIconError = 'Image size is too large.';
				$scope.skill.icon_image = "";
				$scope.skill.iconimage = "";
				$scope.user.profile_image = "";
				$scope.myIconImage = "";
			}
		}
	};

	$scope.statusChange = function() {
		$scope.showImage = false;
	}

	$scope.removeIconImg = function() {
		$scope.skill.icon = "";
		$scope.picIconData = "";
		$scope.myIconImage = "";
	}


	$scope.update = function(invalid) {
		$scope.loader = true;

		if (typeof $scope.user.profile_image == 'object') {
			$scope.user.profile_image = $scope.myCroppedIconImage;
		}
		if ($scope.user.location == "") {
			$scope.showAddress = true;

		} else {
		}
		//$scope.user.phone="+1"+$scope.user.phone
		console.log("================",$scope.user)
		UserService.updateUserdata($scope.user, function(response) {

			if (response.messageId == 200) {
				$scope.showmessage = true;
				$scope.alerttype = 'alert alert-success';

				$timeout(function(argument) {
					$scope.showmessage = false;
					$state.go("/users");
					$scope.loader = false;
					toastr.success(response.message);
				}, 2000)

				//$state.go('/users');
			} else {

				$scope.showmessage = true;
				$scope.alerttype = 'alert alert-error';
				$timeout(function(argument) {
					$scope.showmessage = false;
					$state.go("/users");
					$scope.loader = false;
					toastr.error(response.message);
				}, 2000)
			}


		})

	}

	if ($stateParams._id && $stateParams.id) {
		var inputString = {
			"_id": $stateParams._id
		}
		UserService.unSubscribe(inputString, function(response) {

			if (response.messageId == 200) {
				$scope.message = response.message;
				$timeout(function(argument) {
					$scope.showmessage = false;
					$state.go("/users");
				}, 2000)
			}
		})
	}

	$scope.view = function(data) {
		$scope.viewList = data;
	}
}]);

flirtme.filter('typeof', function() {
	return function(obj) {
		return typeof obj
	};
});
