/************************************************************************************************************
 * 实现功能：针对系统中公共配置
 * 创    建：张洪波   2020年05月20日
 * 最近更新: 张洪波   2020年05月20日
 * 相关说明：
 * 附注说明：
 *************************************************************************************************************/

//针对业务的公共配置
const commBnsConfig = {
  //当前环境基本配置
  baseCfg: {
    // 当前环境基本配置.环境类型:Product:生产环境,Dvlp:开发环境,Test:测试环境
    envirType: "Product",

    // 当前环境中的语言种类（目前只支持中文，该属性预留）
    languageKind: "Zh-CN",

    /**
     * 获取数据的方式:
     * FromServeiceJsonFile:从JSON文件方式
     * FromServeiceByProxy:正常服务（通过代理方式间接调用）
     * FromServeiceByNormal:正常服务(正常的方式直接调用)
     */
    FecthDataWay: "FromServeiceByNormal",

    //当前环境中:模式:调试模式:Debug,正常模式:Normal,
    RunMode: "Debug",

    //当前环境中:默认strDefaultWebServerHost地址
    // strDefaultWebServerHost: "api.dev.smartlab.vip",
    strDefaultWebServerHost: "api.pro.smartlab.vip",

    //JSON静态JSON根目录(建议是绝对配置配置)
    strJsonDataRootPath: "/static/JSON",

		//用户头像路径
		pictureUrl:"https://dianzikancha-dev-user-avatar.obs.cn-south-1.myhuaweicloud.com/"
		// pictureUrl:"https://dianzikancha-user-avatar.obs.cn-south-1.myhuaweicloud.com/"
  },

  //当前业务额外数据
  /**
   * @todo web端未使用，可删除
   */
  objBnsExtraData: {
    // 需要持久化的额外数据
    objPersistentData: {},
  },
};

/**
 * 设置持久化数据到配置中，会自动保存到本地
 * @param {string} strKey 保存使用的键
 * @param {type} value 保存的值
 * @param {Boolean} override 如果原来有值，是否覆写原来的值，如果不覆写会返回失败
 * @return {Boolean} 保存是否成功
 */
commBnsConfig.FunSetPersistentData = function (strKey, value, override = true) {
  try {
    if (override) {
      localStorage.setItem(strKey, JSON.stringify(value));
    } else {
      let oldValue = localStorage.getItem(strKey);
      // 原来有值，返回false
      if (oldValue !== null) return false;
      localStorage.setItem(strKey, JSON.stringify(value));
    }
  } catch (e) {
    console.log("FunSetPersistentData出错");
    return false;
  }
  commBnsConfig.objBnsExtraData.objPersistentData[strKey] = value;
  return true;
}

/**
 * 获取持久化数据到配置中，先从配置中找，再从本地找并加到配置中
 * @param {string} strKey 键
 * @return {type} 对应的值，如果没有找到，模仿uni的，返回""
 */
commBnsConfig.FunGetPersistentData = function (strKey) {
  if (typeof commBnsConfig.objBnsExtraData.objPersistentData[strKey] !== "undefined") {
    return commBnsConfig.objBnsExtraData.objPersistentData[strKey];
  }
  try {
    const retValue = JSON.parse(localStorage.getItem(strKey)) || "";
    commBnsConfig.objBnsExtraData.objPersistentData[strKey] = retValue;
    return retValue;
  } catch (e) {
    return "";
  }
}

/**
 * 预加载一些持久化的数据到配置中，建议应用创建时调用
 * @param {Array} arrKeys 需要加载的数据
 * @return {Number} 加载成功的数量
 * @todo web端未使用，可删除
 */
commBnsConfig.FunPreloadPersistentData = function (arrKeys) {
  var count = 0;
  for (let i = 0; i < arrKeys.length; i++) {
    if (commBnsConfig.FunGetPersistentData(arrKeys[i]) !== "") {
      count++;
    }
  }
  return count;
}

/**
 * 当前环境配置
 */
commBnsConfig.funcGetEnvirCfg = function () {
  const objCurCfg = {
    //当前Web请求配置
    objWebServerCfg: {},
    //当前应用的配置
    objAppCfg: {
      strAppID: "8cg78c041b2b28c734c3e5b7534cbb8p",
      strAppKey: "b774cfe9fc8776b961a650df3efb3mf3"
    },
  };

  switch (commBnsConfig.baseCfg.envirType || "Dvlp") {
    default:
    case "Dvlp":
      {
        const host = commBnsConfig.baseCfg.strDefaultWebServerHost || "localhost";
        objCurCfg.objWebServerCfg = {
          strWebServiceUrl: `http://${host}:80`,
          strWebServiceProxyPostUrl: 
            `http://${host}:9036/MyPorxy/ProxyWebURLForPOST`,
          strWebServiceProxyGetUrl:
            `http://${host}:9036/MyPorxy/ProxyWebURLForGET`,
          strWebServiceUrlOfReal: 
            "https://devdes.cbim.org.cn",
        };
      }
      break;
    case "Product":
      {
        const host = commBnsConfig.baseCfg.strDefaultWebServerHost || "110.41.135.43";
        objCurCfg.objWebServerCfg = {
          strWebServiceUrl: `https://${host}:443`,
          strWebServiceProxyPostUrl: 
            `http://${host}:9036/MyPorxy/ProxyWebURLForPOST`,
          strWebServiceProxyGetUrl:
            `http://${host}:9036/MyPorxy/ProxyWebURLForGET`,
          strWebServiceUrlOfReal: 
            "https://devdes.cbim.org.cn",
        };
      }
      break;
    case "Test":
      {
        const host = commBnsConfig.baseCfg.strDefaultWebServerHost || "localhost";
        objCurCfg.objWebServerCfg = {
          strWebServiceUrl: `http://${host}:80`,
          strWebServiceProxyPostUrl: 
            `http://${host}:9036/MyPorxy/ProxyWebURLForPOST`,
          strWebServiceProxyGetUrl:
            `http://${host}:9036/MyPorxy/ProxyWebURLForGET`,
          strWebServiceUrlOfReal: 
            "https://devdes.cbim.org.cn",
        };
      }
      break;
  }
  return objCurCfg;
}

export default commBnsConfig;
