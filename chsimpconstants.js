//Simplified Chinese
const messages = {	
	"errorRetreivingData": "Error occured while retreiving the data from collection",
	"successRetreivingData" : "Data retreived successfully from the collection",
	"failedToRemove" : "Error in removing data",

	//user message
	"userSuccess": "成功存档用户",
	"userStatusUpdateFailure" : "发生错误",
	"userStatusUpdateSuccess" : "成功更新",
	"userDeleteFailure": "发生错误",
	"userDeleteSuccess": "成功删除",


	//Email message
	"phoneExist":"电话号码已存在",
	"confirmPassword" : "请确认您的密码",
	"notMatch" : "两次密码不一样",
	"phoneEmail":"电话号码无效",
	"errorInput":"输入有误",
	"notExist":"电话号码不存在",
	"erroUpdate":"Error while updating",
	"phoneSuccess":"电话号码发送成功",
	"requiredField":"Please pass required fields.",
	"wrongInp":"发生错误",
	"validInformation":"请输入有效信息",
	"passwordReset":"密码成功更新",
	"passwordNotSame":"新密码不可与现有密码一致",
    "oldPasswordError":"旧密码错误",
    "dataNotSaved":"数据为存储",
    "dataNotFound":"找不到数据",
    "errorTryAgain":"请再试一次",
    "notFound":"无法找到，请再尝试",
    "mailNotsent":"成功注册但未发送邮件",

}

var obj = {messages:messages};
module.exports = obj; 
