
/************************************************************************************************************
 * 实现功能:基于SHA1的API签名算法
 * 创    建:张洪波   2020年05月20日
 * 最近更新: 张洪波   2020年05月20日
 * 相关说明:
 * 附注说明:附注说明:这里的签名指的并不是数字证书中的非对称签名算法，是一般的签名，例如：为API接口签名
 *************************************************************************************************************/

//引入的SHA1的数据
import utilSHA1 from "./utilSHA1.js";

//本模块导出的对象
var utilSignBaseSHA1 = {};

/**
 * 实现功能:得到要签名的字符串
 * @param {Object} arrData       数组的内容
 * @param {Object} strSplitChar  之间的分隔符,默认为:&
 * @param {Object} sortWay  	 数组中的数据排序方式:NoSotr:不排序，Asc:升序排序，Desc:降序排序,默认为不排序
 *
 */
utilSignBaseSHA1.FuncGetToSignStr = function(arrData,strSplitChar,sortWay)
{
    var strRetVal = "";

    strSplitChar = !strSplitChar?"&":strSplitChar;
    sortWay = !sortWay?"NoSotr":sortWay;

    if (arrData == null || arrData.length <= 0)
    {
        strRetVal = "";
    }
    else
    {
        if (sortWay == "Desc")
        {
            arrData = arrData.reverse();
        }

        strRetVal = arrData.join(strSplitChar);
    }

    return strRetVal;
};

/**
 * 实现功能:基于HexSHA1的签名算法
 * @param {Object} arrData       数组的内容
 * @param {Object} strSplitChar  之间的分隔符,默认为:&
 * @param {Object} sortWay  	 数组中的数据排序方式:NoSotr:不排序，Asc:升序排序，Desc:降序排序,默认为不排序
 *
 */
utilSignBaseSHA1.FuncHexSHA1SignBase = function(arrData,strSplitChar,sortWay)
{
    var strRetVal = "",strData = "";

    strData = this.FuncGetToSignStr(arrData,strSplitChar,sortWay);

    strRetVal = utilSHA1.FuncHexSa1(strData);

    return strRetVal;
};

/**
 * 实现功能:基于Base64Sha1的签名算法
 * @param {Object} arrData       数组的内容
 * @param {Object} strSplitChar  之间的分隔符,默认为:&
 * @param {Object} sortWay  	 数组中的数据排序方式:NoSotr:不排序，Asc:升序排序，Desc:降序排序,默认为不排序
 *
 */
utilSignBaseSHA1.FuncBase64Sha1SignBase = function(arrData,strSplitChar,sortWay)
{
    var strRetVal = "",strData = "";

    strData = this.FuncGetToSignStr(arrData,strSplitChar,sortWay);

    strRetVal = utilSHA1.FuncBase64Sha1(strData);

    return strRetVal;
};

/**
 * 实现功能:基于StrSHA1的签名算法
 * @param {Object} arrData       数组的内容
 * @param {Object} strSplitChar  之间的分隔符,默认为:&
 * @param {Object} sortWay  	 数组中的数据排序方式:NoSotr:不排序，Asc:升序排序，Desc:降序排序,默认为不排序
 *
 */
utilSignBaseSHA1.FuncStrSHA1SignBase = function(arrData,strSplitChar,sortWay)
{
    var strRetVal = "",strData = "";

    strData = this.FuncGetToSignStr(arrData,strSplitChar,sortWay);

    strRetVal = utilSHA1.FuncStrSha1(strData);

    return strRetVal;
};


/**
 * 实现功能:获得当前API接口签名数据
 * @param {String} strAppKey   当前AppKey
 * @param {String} strPath     当前路径
 * @param {String} strCurTimie 当前时间戳
 * @param {String} strUrlParam 请求的路径上的参数
 * @param {String} strBodyData 请求body中的参数(已转化为String)
 */
utilSignBaseSHA1.FuncGetCurSignData = function(strAppKey,strPath,strCurTimie,strUrlParams,strBodyData)
{
    var strSignResult = "";

    strSignResult = this.FuncHexSHA1SignBase([strAppKey,strPath,strCurTimie,strUrlParams,strBodyData],",","NoSort");

    return strSignResult;
};


export default utilSignBaseSHA1;
