/************************************************************************************************************
 * 实现功能：针对业务中Http的请求
 * 创    建：张洪波   2020年05月25日
 * 最近更新: 张洪波   2020年05月26日
 * 相关说明：
 * 附注说明：
 *************************************************************************************************************/

//导入系统环境
import commBnsConfig from "./commBnsConfig.js";

//针对Hash签名算法的工具类
import utilSignBaseSHA1 from "../commFrmk/commApp/commAppHashUtil/utilSignBaseSHA1.js";

//导入axios的Http请求工具
import httpRequest from "../commFrmk/commApp/axiosHttpRequestUtil/axiosHttpRequest";

import qs from "qs";

let commBnsUniHttpRequest = {
    hasStartRefresh: false
};

//获得当的环境配置
const curEnvirCfg = commBnsConfig.funcGetEnvirCfg();

/**
 * @param {Object} 	 objReqParam 业务请求的参数
 * @param {String}   objReqParam.strWebServiceUrl   			提供Web服务站点地址(不提供则自动从环境中获取:仅用于非代理模式)
 * @param {String}   objReqParam.strWebServiceUrlOfReal  		提供服务的路径(不提供由从环境配置中获取，代理方式的实际URL:仅用于代理模式)
 * @param {String}   objReqParam.strWebServicePath  			提供服务的路径(必须提供，非代理时为实际路径，代理模时为真实路径)
 * @param {String}   objReqParam.strHttpMethod      			请求的方法（目前先考GET和POST两种方法,缺省为POST）
 * @param {String}   objReqParam.strFecthDataWay    			获取数据的方式（详见配置部分）
 * @param {String}   objReqParam.strWebProxyUrl    				代理方式的代理地址(不提供时从环境及上下文中自动计算)
 * @param {Object}   objReqParam.objData  						请求的数据(POST为请求Body，如果是GET由为网址参数)
 * @param {Object}   objReqParam.dictHeader						请求的头部数据(头部数据，可不提供)
 * @param {Object}   objReqParam.dictHeader.appid				请求的头部数据(头部数据，可不提供).AppID
 * @param {Object}   objReqParam.dictHeader.appkey				请求的头部数据(头部数据，可不提供).AppKey
 * @param {Object}   objReqParam.dictHeader.token				请求的头部数据(头部数据，可不提供).Token
 * @param {Object}   objReqParam.dictHeader.sign				请求的头部数据(头部数据，可不提供).API接口签名
 * @param {Object}   objReqParam.dictHeader.ts					请求的头部数据(头部数据，可不提供).时间戳
 * @param {Object}   objBnsContext          					业务上下文
 */
commBnsUniHttpRequest.FuncBnsHttpRequest = function(objReqParam)
{
    //一般参数：objReqParam一般情况下不允许为空
    objReqParam = objReqParam || {};

    objReqParam.objData = cleanObject(objReqParam.objData || {});
    objReqParam.dictHeader = removeExtraContentType(objReqParam.dictHeader || {});
    objReqParam.strFecthDataWay = objReqParam.strFecthDataWay || commBnsConfig.baseCfg.FecthDataWay;
    objReqParam.strWebServiceUrl = 
        (objReqParam.strFecthDataWay !== "FromServeiceByProxy" 
        ? objReqParam.strWebServiceUrl || curEnvirCfg.objWebServerCfg.strWebServiceUrl
        : objReqParam.strWebServiceUrlOfReal || curEnvirCfg.objWebServerCfg.strWebServiceUrlOfReal);
    objReqParam.strHttpMethod = 
        (objReqParam.strFecthDataWay === "FromServeiceJsonFile"
        ? "GET" 
        : (objReqParam.strHttpMethod || "POST").toUpperCase());
    objReqParam.strWebProxyUrl = 
        objReqParam.strWebProxyUrl || 
        (objReqParam.strHttpMethod === "GET" 
        ? curEnvirCfg.objWebServerCfg.strWebServiceProxyGetUrl 
        : curEnvirCfg.objWebServerCfg.strWebServiceProxyPostUrl);
    
    // 根据请求方式对请求参数进行合并转化，同时提取出计算sign需要的参数
    let strUriPath = "";
    let strUriParams = "";
    let strSignBody = "";
    const uri = getUri(objReqParam.strWebServicePath);
    if (objReqParam.strHttpMethod.toUpperCase() === "GET") {
        // GET请求，把URL上的参数提取出来，和objData合并，如果有重复，以objData中的为准
        // uniapp不会在URL放数组参数，这是uniapp的问题，所以改为自己手动设置
        let newUrlParams = convertObjectToUrl(concatObject(objReqParam.objData, uri.query));
        // 直接将参数拼接到url后面
        objReqParam.strWebServicePath = uri.path + newUrlParams;
        // 清除掉请求参数
        objReqParam.objData = {};
        strUriPath = uri.path;
        strUriParams = newUrlParams.substring(1);
        strSignBody = "";
    } else {
        // 其余请求，不做变化
        strUriPath = uri.path;
        strUriParams = uri.strQuery;
        strSignBody = signStringifyBodyParams(objReqParam.objData, objReqParam.dictHeader);
    }

    // 对请求头部公共处理
    // 主要是要做签名和认证，先获取登陆信息
    const signinData = commBnsConfig.FunGetPersistentData("signinData");
    let dictCurHeader = objReqParam.dictHeader;
    //设置Appid
    if (!dictCurHeader.hasOwnProperty("appid") || !dictCurHeader["appid"])
    {
        dictCurHeader["appid"] = curEnvirCfg.objAppCfg.strAppID;
    }

    //设置TS
    if (!dictCurHeader.hasOwnProperty("ts") || !dictCurHeader["ts"])
    {
        dictCurHeader["ts"] = Date.now().toString();
    }

    //设置sign
    if (signinData !== "") {
        if (!dictCurHeader.hasOwnProperty("sign") || !dictCurHeader["sign"])
        {
            const strAppKey = signinData.appKey;
            dictCurHeader["sign"] =
                utilSignBaseSHA1.FuncGetCurSignData(
                    strAppKey,
                    strUriPath,
                    dictCurHeader["ts"],
                    strUriParams,
                    strSignBody);
        }
    }
    objReqParam.dictHeader = dictCurHeader;

    // 获取请求
    return new Promise(function(resolve,reject)
    {
        let strUrl = "";

        switch(objReqParam.strFecthDataWay)
        {
            //暂无使用FromServeiceJsonFile
            case "FromServeiceJsonFile":
            {
                // strUrl = commBnsConfig.baseCfg.strJsonDataRootPath + objReqParam.strWebServicePath;
                // let strFileRear = strUrl.substr(strUrl.lastIndexOf(".")+1);

                // if (strFileRear.toLowerCase() === "json")
                // {
                //     const strFileShortName = strUrl.substring(strUrl.lastIndexOf("/")+1,strUrl.lastIndexOf("."));

                //     if (BnsSimulateData[strFileShortName])
                //     {
                //         console.log(BnsSimulateData[strFileShortName]);
                //         resolve([BnsSimulateData[strFileShortName]]);
                //     }
                //     else
                //     {
                //         resolve([null, "当前:" + strUrl + "对应的数据并不存在!"]);
                //     }
                // }
            }
            break;
            case "FromServeiceByNormal":
            {
                strUrl = objReqParam.strWebServiceUrl + objReqParam.strWebServicePath;

                httpRequest.FuncHttpRequest
                ({
                    strUrl: strUrl,
                    strHttpMethod: objReqParam.strHttpMethod,
                    objData: objReqParam.objData,
                    dictHeader: objReqParam.dictHeader
                })
                .then(res => {
                    resolve([res]);
                })
                .catch(err => {
                    console.log(err);
                    if(!err) {
                        err = "网络错误";
                    } else if(err === "请求中断") {
                        resolve([null, null]);
                    } else {
                        resolve([null, err]);
                    }     
                });
            }
            break;
            case "FromServeiceByProxy":
            {
                strUrl = objReqParam.strWebServiceUrl  + objReqParam.strWebServicePath;

                httpRequest.FuncHttpRequest
                ({
                    strUrl: objReqParam.strWebProxyUrl,
                    strHttpMethod: objReqParam.strHttpMethod,
                    objData:
                        {
                            strRealUrl: strUrl,
                            //strRealUrlPath:strRealUrlPath,
                            blIsHttps: true,
                            strPostJsonData: JSON.stringify(objReqParam.objData),
                            strUrlJsonParam: JSON.stringify({}),
                            strJsonHeader: JSON.stringify(objReqParam.dictHeader)
                        },
                    dictHeader: objReqParam.dictHeader
                })
                .then(
                    res =>
                    {
                        resolve([res]);
                    },
                    err =>
                    {
                        if(!err) {
                            err = "网络错误";
                        } else if(err === "请求中断") {
                            resolve([null, null]);
                        } else {
                            resolve([null, err]);
                        }  
                    }
                );
            }break;
            default:
        }
    });
};

commBnsUniHttpRequest.FuncBnsHttpRequestWithPost = function(strWebServicePath, objData, dictHeader,isJson=false)
{
    // POST请求所有参数在body里，uniapp会自动将data中的参数放到body上
    // uniapp根据Header中的Content-Type确定参数在body中的形式，默认是json格式，这里因为大部分接口都是urlencoded格式的，所以改下默认
    // 不同于Get，这里不把URL中的参数放到objData中，因为有可能objData是json格式，放到objData中可能导致后端反序列化失败
    return this.FuncBnsHttpRequest({
        strWebServicePath,
        objData,
        dictHeader: {
            ...dictHeader,
            "Content-Type": isJson ? "application/json" : "application/x-www-form-urlencoded",
        },
        strHttpMethod: 'POST',
    });
};

/**
 * 带Formdata的Post
 * @param strWebServicePath
 * @param urlParams
 * @param formDataObject
 * @param dictHeader
 * @returns {*}
 * @constructor
 */
commBnsUniHttpRequest.FuncBnsHttpRequestWithPostFormDataAndUrlParams = function(strWebServicePath, urlParams, formDataObject, dictHeader) {
    let formData = new FormData();
    if(formDataObject && (JSON.stringify(formDataObject) !== '{}')) {
        Object.keys(formDataObject).forEach(key => formData.append(key, formDataObject[key]));
    }

    if(urlParams) {
        strWebServicePath += '?' + Object.keys(urlParams).map(key => {return `${encodeURIComponent(key)}=${encodeURIComponent(urlParams[key])}`}).join('&');
    }

    return this.FuncBnsHttpRequest({
        strWebServicePath,
        objData: formData,
        dictHeader: {
            ...dictHeader,
            "Content-Type": "multipart/form-data"
        },
        strHttpMethod: "POST"
    });
}

/**
 * 带Formdata的Post 上传数组
 * @param strWebServicePath
 * @param urlParams
 * @param formDataObject
 * @param dictHeader
 * @returns {*}
 * @constructor
 */
commBnsUniHttpRequest.FuncBnsHttpRequestWithPostArrayFormDataAndUrlParams = function(strWebServicePath, urlParams, formDataObject, dictHeader) {
    let formData = new FormData();
    if(formDataObject && (JSON.stringify(formDataObject) !== '{}')) {
        Object.keys(formDataObject).forEach(key => {
            if (Array.isArray(formDataObject[key])) {
                for (let i = 0; i < formDataObject[key].length; i++) {
                    formData.append(key,formDataObject[key][i]);
                }
            } else {
                formData.append(key, formDataObject[key])
            }
        });
    }

    if(urlParams) {
        strWebServicePath += '?' + Object.keys(urlParams).map(key => {return `${encodeURIComponent(key)}=${encodeURIComponent(urlParams[key])}`}).join('&');
    }

    return this.FuncBnsHttpRequest({
        strWebServicePath,
        objData: formData,
        dictHeader: {
            ...dictHeader,
            "Content-Type": "multipart/form-data"
        },
        strHttpMethod: "POST"
    });
}

commBnsUniHttpRequest.FuncBnsHttpRequestWithGet = function(strWebServicePath,objData,dictHeader)
{
    // GET请求
    return this.FuncBnsHttpRequest({
        strWebServicePath,
        objData,
        dictHeader,
        strHttpMethod: "GET"
    });
};

commBnsUniHttpRequest.FuncBnsHttpRequestWithPut = function(strWebServicePath,objData,dictHeader,isJson=false)
{
    //PUT请求
    return this.FuncBnsHttpRequest({
        strWebServicePath,
        objData,
        dictHeader: {
            ...dictHeader,
            "Content-Type": isJson ? "application/json" : "application/x-www-form-urlencoded"
        },
        strHttpMethod: "PUT"
    });
};

commBnsUniHttpRequest.FuncBnsHttpRequestWithDelete = function(strWebServicePath,objData,dictHeader,isJson=false)
{
    //DELETE请求
    return this.FuncBnsHttpRequest({
        strWebServicePath,
        objData,
        dictHeader: {
            ...dictHeader,
            "Content-Type": isJson ? "application/json" : "application/x-www-form-urlencoded"
        },
        strHttpMethod: "DELETE"
    });
};

/* 分离开请求路径和请求路径上的参数，参数如果键有重复的，取最后一个的值 */
function getUri(strPath) {
    let uri = {};
    strPath = strPath.trim();
    const lastPos = strPath.lastIndexOf("?");

    if (lastPos < 0) {
        uri.path = strPath;
        uri.strQuery = "";
        uri.query = {};
        return uri;
    }
    uri.path = strPath.substring(0, lastPos);
    let queryStr = lastPos === strPath.length ? "" : strPath.substring(lastPos + 1);
    uri.strQuery = queryStr;
    uri.query = {};
    while(queryStr.length !== 0) {
        let index = queryStr.indexOf("&");
        if (index < 0) {
            index = queryStr.length;
        }
        let oneQueryStr = queryStr.substring(0, index);
        let splitIndex = oneQueryStr.indexOf("=");
        if (splitIndex > 0 && splitIndex < oneQueryStr.length - 1) {
            let k = oneQueryStr.substring(0, splitIndex);
            let v = oneQueryStr.substring(splitIndex + 1).trim();
            if (k.endsWith("[]") && k.length > 2) {
                let k1 = k.substring(0, k.length - 2);
                if (Object.prototype.toString.call(uri.query[k1]) === "[object Array]") {
                    uri.query[k1].push(v);
                } else {
                    uri.query[k1] = [v];
                }
            } else {
                uri.query[k] = v;
            }
        }
        queryStr = queryStr.substring(index + 1);
    }

    return uri;
}

/* 合并两个对象，以前面对象为准，因为是对象是引用传递，objSenior的值会被修改 */
function concatObject(objSenior, objJunior) {
    objSenior = objSenior || {};
    const keys = Object.keys(objJunior);
    for (let key of keys) {
        if (!objSenior[key]) {
            objSenior[key] = objJunior[key];
        }
    }
    return objSenior;
}

/* 去除对象中值为null，undefined的属性 */
function cleanObject(objData) {
    objData = objData || {};
    const keys = Object.keys(objData);
    for (let key of keys) {
        if (objData[key] === null || typeof objData[key] === "undefined") {
            delete objData[key];
        }
        if (typeof objData[key] === "string") {
            objData[key] = objData[key].trim();
        }
    }
    return objData;
}

/* 将object类型转化为url字符串参数 */
function convertObjectToUrl(objParams) {
    const strParams = qs.stringify(objParams, {encode: true});
    return strParams !== "" ? `?${strParams}` : "";
}

/**
 * 将Object类型的参数转化成可以直接拼接在url后面的字符串
 * @param {Object} objParams      参数
 * @param {Boolean} hasDelimiter  结果需不需要开始的'?'
 * @return {String} 可以直接拼在url后面的参数字符串
 */
commBnsUniHttpRequest.FuncConvertObjToUriParams = function(objParams, hasDelimiter = true) {
    objParams = cleanObject(objParams);
    if (hasDelimiter === true) {
        return convertObjectToUrl(objParams);
    }
    return convertObjectToUrl(objParams).substring(1);
}

/* 除去多余的Content-Type */
function removeExtraContentType(objHeader) {
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
    objHeader["Content-Type"] = type;
    return objHeader;
}

/**
 * 根据请求类型获取body中的需要加密的结果
 * @param {Object} objBodyParams    body的参数
 * @param {Object} objHeader        请求头
 * @return {String} 应该是请求中body的数据
 */
function signStringifyBodyParams(objBodyParams, objHeader) {
    objBodyParams = objBodyParams || {};
    objHeader = objHeader || {};
    const keys = Object.keys(objHeader);
    let type = "";
    for (let key of keys) {
        if (key.toLowerCase() === "content-type") {
            type = objHeader[key];
        }
    }
    if (type === "application/json") {
        return JSON.stringify(objBodyParams, null, 0);
    }
    if (type === "application/x-www-form-urlencoded") {
        return qs.stringify(objBodyParams, {encode: false});
    }
    if(type === 'multipart/form-data') {
        return "";
    }
    return "";
}

export default commBnsUniHttpRequest;
