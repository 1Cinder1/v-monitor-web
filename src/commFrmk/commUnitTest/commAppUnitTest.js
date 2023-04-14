
/************************************************************************************************************
 * 实现功能：实现SHA1散列加密算法
 * 创    建：张洪波   2020年05月20日
 * 最近更新: 张洪波   2020年05月20日
 * 相关说明：
 * 附注说明：
*************************************************************************************************************/

//SHA1的工具类引入
import utilSHA1 from "../commApp/commAppHashUtil/utilSHA1.js";

//基于SHA1签名的工具类
import utilSignBaseSHA1 from "../commApp/commAppHashUtil/utilSignBaseSHA1.js";

/**
 * 针对utilSHA1的单元测试
 * @param {Object} blIsExecute
 */
var utilSHA1UnitTest = function(blIsExecute)
{
	blIsExecute = (blIsExecute == null?false:blIsExecute);
	
	if (!blIsExecute)
	{
		return;
	}
	
	console.log("---------------------------SHA1算法的单元测试--------------------------------------------")
	
	var strData = "我想我是海";
	var strResult = "";
	
	strResult = utilSHA1.FuncHexSa1(strData);
	console.log("当前源内容为:" + strData + "HexSHA1加密的结果为:" + strResult);
	
	strResult = utilSHA1.FuncBase64Sha1(strData);
	console.log("当前源内容为:" + strData + "HexSHA1加密的结果为:" + strResult);
	
	strResult = utilSHA1.FuncStrSha1(strData);
	console.log("当前源内容为:" + strData + "HexSHA1加密的结果为:" + strResult);
};

/**
 * 针对utilSHA1的单元测试
 * @param {Object} blIsExecute 真:执行，假:不执行，默认不执行
 */
var utilSignBaseSHA1UnitTest = function(blIsExecute)
{
	blIsExecute = (blIsExecute == null?false:blIsExecute);
	
	if (!blIsExecute)
	{
		return;
	}
			
	var arrData = ["b774cfe9fc8776b961a650df3efb3mf3","/external/api/user/request_ticket","1590041209314"];
	var strResult = "",strExceptVal = "16212c36ca125610e460bd1e9f91999712c12767";
	strResult = utilSignBaseSHA1.FuncHexSHA1SignBase(arrData,",","NoSort");	
	console.log("当前原源文为:"+arrData.join(",") + ",签名的结果为:" + strResult);	
	console.log("当前签名的结果:" + (strResult == strExceptVal?"成功":"失败"));
};

var commAppUnitTest = 
{
	utilSHA1UnitTest:utilSHA1UnitTest,
	utilSignBaseSHA1UnitTest:utilSignBaseSHA1UnitTest
};

export default commAppUnitTest;
