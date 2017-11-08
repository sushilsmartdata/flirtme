"use strict";

angular.module("Jobs")

oddjob.controller("jobController", ['$stateParams', '$state','$scope','$http', '$rootScope', '$localStorage', 'JobService', 'ngTableParams', '$route', '$location','SweetAlert','$timeout','$filter',  function($stateParams, $state,$scope,$http, $rootScope, $localStorage, JobService, ngTableParams, $route, $location,SweetAlert,$timeout,$filter){

	
	if($localStorage.userLoggedIn) {
		$rootScope.userLoggedIn = true;
		$rootScope.loggedInUser = $localStorage.loggedInUsername;
        $rootScope.displayImage = $localStorage.displayImage;
	}
	else {
		$rootScope.userLoggedIn = false;
	}

	
	if($rootScope.message != "") {

		$scope.message = $rootScope.message;
	}
    $rootScope.sideBar="job";

	//empty the $scope.message so the field gets reset once the message is displayed.
	$scope.message = "";
	$scope.job = {job: "", enable: false}
	//Toggle multilpe checkbox selection
	$scope.selection = [];
	$scope.selectionAll;
	$scope.toggleSelection = function toggleSelection(id) { 

            //Check for single checkbox selection
            if(id){
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
      
                var myEl1 = angular.element(document.getElementsByClassName("list"+$scope.tableParams.page()));            
                //alert(myEl1.length)
                var ln = 0;
                for(var i=0; i< myEl1.length; i++) {
                    if(myEl1[i].checked)
                        ln++
                    if(ln==myEl1.length){
                        myEl.attr('checked',true);
                    }else{
                        myEl.attr('checked',false); 
                    }
                }

            }
            //Check for all checkbox selection
            else{ 
                var myEl = angular.element(document.getElementsByClassName("select-all"));
               
                if(myEl.attr('checked')==undefined){ 
                    
                    var i=0;
                    angular.forEach($scope.tableParams.data, function(item) {
                        var idx = $scope.selection.indexOf(item._id);
                    // is currently selected
                   
                        $scope.checkboxes.items[item._id] = false;
                         if (idx > -1) { 
                        $scope.selection.splice(idx,1);
                        //alert(i)
                        i++;
                        }
                    });

                    $scope.selectionAll = false;
                }
                //Check for all un checked checkbox for check
                else{ 
                    $scope.selectionAll = true
                    if($scope.selection.length==0)
                    $scope.selection = [];
                   
                    console.log($scope.tableParams.data)
                    var i=0;
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
            console.log($scope.selection)
        };


        	//apply global Search
        	$scope.applyGlobalSearch = function() {
        		var term = $scope.globalSearchTerm;
        		if(term != "") {
        			if($scope.isInvertedSearch) {
        				term = "!" + term;
        			}
                    $scope.simpleList = $filter('filter')($scope.simpleList2, term);
        			$scope.tableParams.filter({$ : term});
        			$scope.tableParams.reload();	
                    $scope.selection = [];
                        $scope.checkboxes.items=[];
                        var myEl = angular.element(document.getElementsByClassName("select-all"));
                        myEl.attr('checked',false); 		
            		}
        	}


        	$scope.getAllJob = function(){
                    var pageNo=1;
                    var sorting={_id:"desc"};
                    var filter={title: '', is_deleted: false};
                    var count=10;
                    if(typeof $scope.tableParams=='object'){
                                var pageNo=$scope.tableParams.page();
                                var sorting=$scope.tableParams.sorting();
                                var filter=$scope.tableParams.filter();
                                //console.log("pageNo ",pageNo," sorting ",sorting," filter ",filter );
                            }
                $scope.loader=true;
        		JobService.getJobList (function(response) {
        			if(response.messageId == 200) {
                        $scope.loader=false;
        				
        				var totalPage=(Math.ceil(response.data.length/count));
                        pageNo=pageNo>totalPage?totalPage:pageNo;
                        $scope.tableParams = new ngTableParams({page:pageNo, count:count, sorting:sorting, filter:filter}, { total:response.data.length, counts:[], data: response.data});

			//multiple checkboxes
			//console.log(response.data)
			$scope.simpleList = response.data;
            $scope.simpleList2 = response.data;
			$scope.jobData = response.data;;
			$scope.checkboxes = {
				checked: false,
				items:{}
					};	
				}
			});
        	}
            //apply global Search for payment history
            $scope.applyGlobalSearch1 = function() {
                var term = $scope.globalSearchTerm;
                if(term != "") {
                    if($scope.isInvertedSearch) {
                        term = "!" + term;
                    }
                    $scope.simpleList = $filter('filter')($scope.simpleList2, term);
                    $scope.tableParams.filter({$ : term});
                    $scope.tableParams.reload();    
                    $scope.selection = [];
                        $scope.checkboxes.items=[];
                               
                    }
            }
            $scope.showDetail=function (index){
                    
                    var myEl = angular.element(document.getElementById("detail_"+index));
                     //myEl.css("visibility","visible");
                      myEl.css("display","table-row");
                     var myEl1 = angular.element(document.getElementById("show_"+index));
                     myEl1.css("display","block");
                     var myEl2 = angular.element(document.getElementById("hide_"+index));
                     myEl2.css("display","none");
            }
             $scope.hideDetail=function (index){ 
                    var myEl = angular.element(document.getElementById("detail_"+index));
                    // myEl.css("visibility","collapse");
                     myEl.css("display","none");
                     var myEl1 = angular.element(document.getElementById("show_"+index));
                     myEl1.css("display","none");
                     var myEl2 = angular.element(document.getElementById("hide_"+index));
                     myEl2.css("display","block");
            }
            $scope.paymentHistory = function(){
                    $rootScope.sideBar="payment";

                    var pageNo=1;
                    var sorting={_id:"desc"};
                    var filter={title: '', is_deleted: false};
                    var count=10;
                    if(typeof $scope.tableParams=='object'){
                                var pageNo=$scope.tableParams.page();
                                var sorting=$scope.tableParams.sorting();
                                var filter=$scope.tableParams.filter();
                                //console.log("pageNo ",pageNo," sorting ",sorting," filter ",filter );
                            }
                $scope.loader=true;
                JobService.paymentHistory (function(response) {
                    if(response.messageId == 200) {
                        $scope.loader=false;
                        
                        var totalPage=(Math.ceil(response.data.length/count));
                        pageNo=pageNo>totalPage?totalPage:pageNo;
                        $scope.tableParams = new ngTableParams({page:pageNo, count:count, sorting:sorting, filter:filter}, { total:response.data.length, counts:[], data: response.data});

            
            $scope.jobData = response;
            $scope.checkboxes = {
                checked: false,
                items:{}
                    };  
                }
            });
            }


        	$scope.activeTab = 0;
        	$scope.findOne = function () {
        		console.log($stateParams.jobId)
        		if ($stateParams.jobId) {
                    $scope.loader=true;
        			JobService.getJob ($stateParams.jobId, function(response) {
                        $scope.loader=false;
        				console.log(response);
        				if(response.messageId == 200) {
        					$scope.job = response.data;
        				}
        			});
        		}else{
                    $scope.job.enable=true;
                }
        	}


            $scope.viewDetail = function (jobId) {
                //console.log($stateParams.jobId)
                if (jobId) {
                    $scope.loader=true;
                    JobService.getJob (jobId, function(response) {
                        console.log(response);
                        if(response.messageId == 200) {
                            $scope.jobdetail = response.data;
                            $timeout(function() {
                                $scope.loader=false;
                                $('#myModal').modal('show');
                            }, 100);
                        }
                    });
                }
            }

        	
        	$scope.updateData = function (job) {

             

        		if ($scope.job._id) { 
        			//console.log($scope.job);
        			var inputJsonString = $scope.job;
                    console.log("job data ",inputJsonString);
        			JobService.updateJob(inputJsonString, $scope.job._id, function(response) {
        				if(response.messageId == 200) {
                           
                            SweetAlert.swal("Updated!", response.message, "success");
        				    $state.go( "/jobs" );
        				}	
        				else{
        					SweetAlert.swal("Error!", response.message, "error");
        				} 
        			});
        		}
        		else{ 

        			var inputJsonString = $scope.job;console.log(inputJsonString);
        			JobService.saveJob(inputJsonString, function(response) {

        				if(response.messageId == 200) {
        					
        					$stateParams.jobId = response.data
        					$scope.job = response.data;
                            //alert("here")
                            //$scope.job.image=inputJsonString.image;
                            //$scope.uploadFile($scope.job);
                            SweetAlert.swal("Created", response.message, "success");
        					$state.go( "/jobs" );
        				}	
        				else{
        					SweetAlert.swal("Error!", response.message, "error");
        				} 


        			});
        		}
        	}

            $scope.uploadFile=function(skill){
                        //console.log(skill);return false;
                     if(job.image!=undefined){
        //file uploading
         var files = job.image;
        //console.log($scope.file.myFiles);
        
         //alert(files.length)
            //console.log();
            var flag = 0;

            if(files.type!=undefined){
               
                var uploadUrl = "/skills/uploadImage";
                var fd = null;
                fd = new FormData();
                fd.append('file', files);
                fd.append('skillId', skill._id);
                console.log(fd);
                $http.post(uploadUrl, fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                })
                .success(function(res){
                    if (res.code == 200) {
                        $scope.image=res.image;
                        //$scope.successAlert('Success','Profile Pic Successfully Updated');
                       
                       
                    }else{
                        //$scope.errorAlert('Error','There was some error uploading your picture. Please try Uploading them again.');
                    }
                   
                })
                .error(function(){
                    console.log("failure");
                    // alert('There was some error uploading your files. Please try Uploading them again.');
                   // $scope.errorAlert('Error','There was some error uploading your picture. Please try Uploading them again.');
                    
                });
            }else{
                //$scope.errorAlert('Error','Please upload a valid image format(Valid PNG/JPEG Recommended).');
                $scope.showUploadCSV = false;
            }
       
    }else{
        $state.go( "/jobs" );
    }

            }

//perform action
$scope.performAction = function(id,action) {

    var actionsArr=["enable","disable" ,"delete"];


    $scope.selectedAction = selectedAction.value;
    
    if(id!=undefined && action!=undefined){
        $scope.selection.push(id);
        $scope.selectedAction=action;
       
    }
    
    if($scope.selection.length==0){
                    SweetAlert.swal("Error!", "Please check atleast one job post", "error");
                     return false;
                }
                if($scope.selectedAction==0){
                    SweetAlert.swal("Error!", "Please select action", "error");
                     return false;
                }
    
    
	var skillLength =  $scope.selection.length;

	var updatedData = [];
	
	console.log($scope.selectedAction )
	if($scope.selectedAction == 0)
		$scope.message = messagesConstants.selectAction;
	else{	
		for(var i = 0; i< skillLength; i++){
			var id =  $scope.selection[i];
			if($scope.selectedAction == 3) {
				updatedData.push({id: id, is_deleted: true});
			}
			else if($scope.selectedAction == 1) {
				updatedData.push({id: id, enable: true});
			}
			else if($scope.selectedAction == 2) {
				updatedData.push({id: id, enable: false});
			}
		}
		var inputJson = {data: updatedData}
        SweetAlert.swal({
                             title: "",
                             text: "Are you sure you want to "+actionsArr[$scope.selectedAction-1]+"?",
                             type: "warning",
                             showCancelButton: true,
                             confirmButtonColor: "#3c8dbc",confirmButtonText: actionsArr[$scope.selectedAction-1].charAt(0).toUpperCase()+actionsArr[$scope.selectedAction-1].substring(1),
                             cancelButtonText: "Cancel",
                             closeOnConfirm: true,
                             closeOnCancel: true, 
                             allowOutsideClick: false }, 
                             function(isConfirm){ 
                                 if (isConfirm) {
                                    
                                    var inputJson = {
                                        data: updatedData
                                    }
                                   JobService.updateJobStatus(inputJson, function(response) {
                                        $scope.getAllJob();
                                        selectedAction.value=0;
                                        $scope.selection=[];
                                    });
                                 }
                              });
		
	}
}

//perform action
$scope.performAction1 = function(id,action) {

    var actionsArr=["enable","disable" ,"delete"];


    
        $scope.selection=[id];
        $scope.selectedAction=action;
       
   
    
    if($scope.selection.length==0){
                    SweetAlert.swal("Error!", "Please check atleast one job post", "error");
                     return false;
                }
                if($scope.selectedAction==0){
                    SweetAlert.swal("Error!", "Please select action", "error");
                     return false;
                }
    
    
    var skillLength =  $scope.selection.length;

    var updatedData = [];
    
    console.log($scope.selectedAction )
    if($scope.selectedAction == 0)
        $scope.message = messagesConstants.selectAction;
    else{   
        for(var i = 0; i< skillLength; i++){
            var id =  $scope.selection[i];
            if($scope.selectedAction == 3) {
                updatedData.push({id: id, is_deleted: true});
            }
            else if($scope.selectedAction == 1) {
                updatedData.push({id: id, enable: true});
            }
            else if($scope.selectedAction == 2) {
                updatedData.push({id: id, enable: false});
            }
        }
        var inputJson = {data: updatedData}
        SweetAlert.swal({
                             title: "",
                             text: "Are you sure you want to "+actionsArr[$scope.selectedAction-1]+"?",
                             type: "warning",
                             showCancelButton: true,
                             confirmButtonColor: "#3c8dbc",confirmButtonText: actionsArr[$scope.selectedAction-1].charAt(0).toUpperCase()+actionsArr[$scope.selectedAction-1].substring(1),
                             cancelButtonText: "Cancel",
                             closeOnConfirm: true,
                             closeOnCancel: true, 
                             allowOutsideClick: false }, 
                             function(isConfirm){ 
                                 if (isConfirm) {
                                    
                                    var inputJson = {
                                        data: updatedData
                                    }
                                   JobService.updateJobStatus(inputJson, function(response) {
                                        $scope.getAllJob();
                                        $scope.selection=[];
                                    });
                                 }
                              });
        
    }
}



}]).directive('fileModel', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;
      element.bind('change', function () {
        scope.$apply(function () {
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);