import muiHttpRequest from "./axiosHttpRequest.js";

var axiosHttpRequestUtil =
{
	muiHttpRequest:muiHttpRequest
};

if (window)
{
	window.muiHttpRequestUtil = axiosHttpRequestUtil;
}

export default axiosHttpRequestUtil;
