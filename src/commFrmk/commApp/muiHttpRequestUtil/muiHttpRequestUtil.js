import muiHttpRequest from "./muiHttpRequest.js";

var muiHttpRequestUtil = 
{
	muiHttpRequest:muiHttpRequest	
};

if (window)
{
	window.muiHttpRequestUtil = muiHttpRequestUtil;
}

export default muiHttpRequestUtil;