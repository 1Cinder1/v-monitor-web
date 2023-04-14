import utilMD5 from "./utilMD5.js";
import utilSHA1 from "./utilSHA1.js";
import utilSignBaseSHA1 from "./utilSignBaseSHA1.js";

var commAppHashUtil =  
{
	utilMD5:utilMD5,
	utilSHA1:utilSHA1,
	utilSignBaseSHA1:utilSignBaseSHA1
};


if (window)
{
	window.commAppHashUtil = commAppHashUtil;
}

export default commAppHashUtil;