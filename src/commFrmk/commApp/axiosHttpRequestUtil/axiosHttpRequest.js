
/************************************************************************************************************
 * 实现功能：基于mui.Request的封装应用
 * 创    建：张洪波   2020年05月25日
 * 最近更新: 张洪波   2020年05月25日
 * 相关说明：
 * 附注说明：(1)该应用应用于UniApp中应用
*************************************************************************************************************/
import axios from 'axios';
import qs from "qs";
const axiosHttpRequest = {};

/**
 * 实现功能:针对UniHttp 的业务处理
 * @param {Object/String} strUrl
 * @param {String} strHttpMethod
 * @param {Object} objData
 * @param {Object} dictHeader
 */
axiosHttpRequest.FuncHttpRequest = function(strUrl, strHttpMethod, objData, dictHeader)
{

	if (typeof(strUrl) == "object" && strUrl.strUrl)
	{
		strHttpMethod = strUrl.strHttpMethod;
		objData = strUrl.objData;
		dictHeader = strUrl.dictHeader;
		strUrl = strUrl.strUrl;
	}

	//初始化请求地址
	strUrl = strUrl || "";
	//初始化方法
	strHttpMethod = (strHttpMethod || "POST").toUpperCase();
	//初始化请求数据
	objData = objData || {};
	//初始化头部数据
  dictHeader = dictHeader || {};

  //headers默认传递json格式数据，这里也可以设置token，每次调用都会携带

  //这里可以在调用的时候看到你的method、url、data、headers等参数
  return new Promise((resolve, reject) => {
    axios({
        method: strHttpMethod,
        url: strUrl,
        data: objData,
        headers: dictHeader,
        transformRequest: [function (data, headers) {
          return stringifyBodyParams(data, headers);
        }]
    })
    .then(res=>{
        resolve(res);
    })
    .catch(err=>{
        reject(err);
    })
  });
};

function stringifyBodyParams(objBodyParams, objHeader) {
    objHeader = objHeader || {};
    const keys = Object.keys(objHeader);
    let type = "";
    for (let key of keys) {
        if (key.toLowerCase() === "content-type") {
          if (type !== "") {
            // 协议规定，不能有多个Content-Type
            delete objHeader[key];
          } else {
            type = objHeader[key];
          }
        }
    }
    // 名称标准化
    if (type !== "") {
      objHeader["Content-Type"] = type;
    }
    if (type === "application/json") {
        return JSON.stringify(objBodyParams, null, 0);
    } else if (type === "application/x-www-form-urlencoded") {
        return qs.stringify(objBodyParams, {encode: false});
    } else {
        return objBodyParams;
    }
}

export default axiosHttpRequest;
