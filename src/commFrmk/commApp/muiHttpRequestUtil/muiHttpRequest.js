
/************************************************************************************************************
 * 实现功能：基于mui.Request的封装应用
 * 创    建：张洪波   2020年05月25日
 * 最近更新: 张洪波   2020年05月25日
 * 相关说明：
 * 附注说明：(1)该应用应用于UniApp中应用
*************************************************************************************************************/

var muiHttpRequest = {};


/**
 * 实现功能:针对UniHttp 的业务处理
 * @param {Object/String} strUrl 
 * @param {String} strHttpMethod
 * @param {Object} objData
 * @param {Object} dictHeader 
 */
muiHttpRequest.FuncHttpRequest = function(strUrl,strHttpMethod,objData,dictHeader)
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
	
	var objCurPromise = new Promise(function(funcResovle, funcReject)
	{
		//如果没有提供失败处理的话，则这里提供默认值
		funcReject = funcReject || function(err)
		{	
			console.log(err);
		};
		
		mui.ajax
		({
			url: strUrl, 
			type:strHttpMethod,
			data:objData, 
			header: dictHeader,
			crossDomain:true,
			contentType:'application/json',
			success:function(data,textStatus,xh)
			{
				funcResovle(data);
			},
			error :function(xhr,type,errorThrown) 
			{
				funcReject(type);
			}
		});
	});
	
	return objCurPromise;
};

if (window)
{
	window.muiHttpRequest = muiHttpRequest;
}

export default muiHttpRequest;