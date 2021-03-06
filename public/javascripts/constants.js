var baseUrl = "http://52.39.212.226:4065";

var webservices = {	

	"authenticate" : baseUrl + "/adminlogin/authenticate",
	"logout" : baseUrl + "/adminlogin/logout",
	"forgot_password" : baseUrl + "/adminlogin/forgot_password",
	"adminResetPassword"	  : baseUrl + "/adminlogin/resetPassword",
	"changePassword" : baseUrl + "/adminlogin/adminChangePassword",	
	"findOneAdminInfo" : baseUrl + "/adminlogin/adminInfo",
	"saveProfile" : baseUrl + "/adminlogin/saveProfile",
	"uploadProImg" : baseUrl + "/adminlogin/uploadProImg",
	"commissionSetting": baseUrl + "/adminlogin/commissionSetting",

	//user
	"addUser" : baseUrl + "/user/add",
	"userList" : baseUrl + "/user/userList",
	"update" : baseUrl + "/users/update",
	"getCurrentUserData":baseUrl + "/user/getCurrentUserData",
	"resetPassword":baseUrl+"/user/resetPassword",
	"unSubscribe":baseUrl+"/user/unSubscribe",
	"allUsersCount":baseUrl+"/user/allUsersCount",
	"exportUserList":baseUrl + "/user/exportFile",
	"deleteUser":baseUrl + "/user/deleteUser",
	"totalUser": baseUrl + "/user/totalUser",
	"latestUser" : baseUrl + "/user/latestUser",
	"updateImage" : baseUrl + "/user/updateImage",
	"usersreport" :baseUrl + "/report/list",
	"unblockuser" :baseUrl + "/user/unblockUser",
	"blockuser" :baseUrl + "/user/blockUser",
	"malefemalemonthly" : baseUrl + "/user/malefemalemonthly",
	


	"bulkUpdateUser" : baseUrl + "/user/bulkUpdate",

	//package

	"addPackage" : baseUrl + "/package/add",
	"packages" : baseUrl + "/package/list",
	"getPackageDetail" : baseUrl + "/package/getdetail",
	"updatePackage" : baseUrl + "/package/updatePackage",
	"deletePackage" : baseUrl + "/package/deletePackage",
	"bulkUpdatePackage" : baseUrl + "/package/bulkUpdate",


	

	// help block 
	"updateHelpBlock":baseUrl+"/help/updateHelpBlock",
	"getHelpBlockListing":baseUrl+"/help/getHelpBlockListing",
	"getHelpInformation":baseUrl+"/help/getHelpInformation",
	"insertHelpInformation":baseUrl+"/help/insertHelpInformation",
	"deleteHelp":baseUrl+"/help/deleteHelp",

	

}
var nav = [
			{text:'Dashboard', path:'/#/',icon:'fa-dashboard',activeText:'home'},
		//	{text:'Esscrow Setting', path:'/#/setting',icon:'fa-cog',activeText:'setting'},
         //   {text:'Manage Skills', path:'/#/skills',icon:'fa-list',activeText:'skill'},
         //   {text:'Manage Job Type', path:'/#/jobtypes',icon:'fa-list',activeText:'jobtype'},
            {text:'Manage Users', path:'/#/users',icon:'fa-users',activeText:'users'},
            {text:'Packages', path:'/#/packages',icon:'fa-users',activeText:'packages'},
            
            {text:'CMS Management', path:'/#/cmslisting',icon:'fa-users',activeText:'cmslisting'},

            {text:'Mange Reports', path:'/#/reports',icon:'fa-users',activeText:'reports'}
            
         
          //  {text:'Manage Jobs', path:'/#/jobs',icon:'fa-briefcase',activeText:'job'},
          //  {text:'Payment History', path:'/#/paymentHistory',icon:'fa-money',activeText:'payment'},
          //   {text:'Feedbacks', path:'/#/feedbacks',icon:'fa-comments',activeText:'feedback'},
            
                         ];

var facebookConstants = {
	"facebook_app_id": "1655859644662114"
}

var googleConstants = {

	"google_client_id" : "54372597586-09u72notkj8g82vl3jt77h7cbutvr7ep.apps.googleusercontent.com",
	
}

var appConstants = {

	"authorizationKey": "dGF4aTphcHBsaWNhdGlvbg=="	
}


var headerConstants = {

	"json": "application/json"

}

var pagingConstants = {
	"defaultPageSize": 10,
	"defaultPageNumber":1
}

var messagesConstants = {

	//users
	"saveUser" : "User saved successfully",
	"updateUser" : "User updated successfully",
	"updateStatus" : "Status updated successfully",
	"deleteUser": "User(s) deleted successfully",

	//questionnaires
	"saveQuestionnaire" : "Questionnaire saved successfully",
	"updateQuestionnaire" : "Questionnaire updated successfully",
	"deleteQuestionnaire" : "Questionnaire deleted successfully",

	//questions
	"saveQuestion" : "Question saved successfully",
	"updateQuestion" : "Question updated successfully",
	"deleteQuestion": "Question deleted successfully",
	"updateStatus" : "Question updated successfully",
	//Error
	"enterQuestion" : "Please enter the question.",
	"selectAnswerType" : "Please select the answer type.",
	"enterAnswer" : "Please enter the answer.",
	"selectAnswerCorrect" : "Please choose the answer as correct.",
	"enterKeyword" : "Please enter the Keyword.",



}

