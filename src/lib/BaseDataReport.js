/*
 * @Description: 埋点上报SDK
 * @Author: qingtong
 * @Date: 2019-05-25 18:53:20
 * @Last Modified by: qingtong
 * @Last Modified time: 2019-05-25 20:06:37
 */

import axios from 'axios';
import { handleWebStorage, getRandomString } from '../util/util';

export default class BaseDataReport {
  constructor(options) {
    // 信息采集必须上传至服务端，若未配置上传地址， 则抛出异常
    if (!options.uploadInfoAddr) {
      throw new Error(`Upload address not configured`);
    }

    // 上传信息地址
    this.uploadInfoAddr = options.uploadInfoAddr;
    // 对所有设备进行采集
    this.allDeviceType = options.allDeviceType ? options.allDeviceType : true;
    // 只对PC类型的设备进行采集
    this.onlyPCDeviceType = options.onlyPCDeviceType ? options.onlyPCDeviceType : false;
    // 只对移动设备进行采集
    this.onlyMobileDeviceType = options.onlyMobileDeviceType ? options.onlyMobileDeviceType : false;
    // 默认只在 production 下才开启采集
    // startCollection 是一个数组，包含可采集信息的环境变量标识符
    this.startCollectionOfEnv = options.startCollectionOfEnv ?
                                options.startCollectionOfEnv :
                                ['production'];
    // 获取地理位置信息API接口配置
    this.getLocalInfoApi = options.getLocalInfoApi || 'https://fe-node-service.uoko.com/api/transResult';
    // 从项目package配置中获取版本号
    this.appVersion = options.appVersion || '';
    // 从项目package配置中获取项目名称
    this.appName = options.appName || '';
    // 获取 系统类型分类标识的 API 地址
    this.getClientPlatformTypeApi = options.getClientPlatformTypeApi || '';
    // 获取初始化时指定的系统编号 sysCode
    this.sysCode = options.sysCode || '';

    // ...
    this.$axios = axios.create({
      withCredentials: false
    })

    // 初始化 init
    this.init();
  }

  // 初始化
  init() {
    // 如果当前模式不是设定的采集开启模式，则退出
    const env = process.env.NODE_ENV;
    if (!this.startCollectionOfEnv.includes(env)) {
      return false;
    }

    // 如果设置仅采集PC或Mobile则将allDeviceType设置为false
    if (this.onlyPCDeviceType || this.onlyMobileDeviceType) {
      this.allDeviceType = false;
    }

    // 判断设备类型，根据配置参数决定是否终止采集
    const deviceType = this._getUserDeviceType();

    // 当前设备为PC且配置为仅在移动设备下采集， 则退出
    if (deviceType === 'PC' && this.onlyMobileDeviceType) {
      return false;
    }

    // 当前设备为Mobile且配置为仅在PC下采集，则退出
    if ((deviceType === 'Android' || deviceType === 'iPhone') && this.onlyPCDeviceType) {
      return false;
    }

    return true;
  }

  // 采集用户操作系统及其版本号
  getUserOS() {
    const userAgent = navigator.userAgent.toLowerCase();
    let osName = 'Unknown', version = 'Unknown';
    if (userAgent.includes(`win`)) {
      osName = 'Windows';
      if (userAgent.includes('windows nt 5.0')) {
        version = 'Windows 2000';
      } else if (userAgent.includes('windows nt 5.1') || userAgent.includes('windows nt 5.2')) {
        version = 'Windows XP';
      } else if (userAgent.includes('windows nt 6.0')) {
        version = 'Windows Vista';
      } else if (userAgent.includes('windows nt 6.1') || userAgent.includes('windows 7')) {
        version = 'Windows 7';
      } else if (userAgent.includes('windows nt 6.2') || userAgent.includes('windows 8')) {
        version = 'Windows 8';
      } else if (userAgent.includes('windows nt 6.3')) {
        version = 'Windows 8.1';
      } else if (userAgent.includes('windows nt 6.2') || userAgent.includes('windows nt 10.0')) {
        version = 'Windows 10'
      }
    } else if (userAgent.includes('iphone')) {
      osName = 'iPhone';
      version = userAgent.match(/(iphone\s{1}.*?\s{1})like/)[1];
    } else if (userAgent.includes('mac') && !userAgent.includes('iphone')) {
      osName = 'Mac';
      version = 'Unknown';
    } else if (userAgent.includes('x11') || userAgent.includes('unix') || userAgent.includes('sunname') || userAgent.includes('bsd')) {
      if (!userAgent.includes('linux') && !userAgent.includes('android')) {
        osName = 'Unix';
        version = 'Unknown';
      }
    } else if (userAgent.includes('linux')) {
      if (userAgent.includes('android')) {
        osName = 'Android';
        version = userAgent.match(/android\s{1}.*?;/)[0];
      } else {
        osName = 'Linux';
        version = 'Unknown';
      }
    }

    return {
      name: osName,
      version
    }
  }

  // 采集用户浏览器类型和版本
  getUserBrowserInfo() {
    function getBrowerInfo() {
      var Browser = Browser || (function(window) {
        var document = window.document,
            navigator = window.navigator,
            agent = navigator.userAgent.toLowerCase(),
            // IE8+支持.返回浏览器渲染当前文档所用的模式
            // IE6,IE7:undefined.IE8:8(兼容模式返回7).IE9:9(兼容模式返回7||8)
            // IE10:10(兼容模式7||8||9)
            IEMode = document.documentMode,
            // chorme
            chrome = window.chrome || false,
            System = {
              // user-agent
              agent: agent,
              // 是否为IE
              isIE: /trident/.test(agent),
              // Gecko内核
              isGecko: agent.indexOf("gecko") > 0 && agent.indexOf("like gecko") < 0,
              // webkit内核
              isWebkit: agent.indexOf("webkit") > 0,
              // 是否为标准模式
              isStrict: document.compatMode === "CSS1Compat",
              // 是否支持subtitle
              supportSubTitle: function() {
                return "track" in document.createElement("track");
              },
              // 是否支持scoped
              supportScope: function() {
                return "scoped" in document.createElement("style");
              },
              // 获取IE的版本号
              ieVersion: function() {
                var rMsie  = /(msie\s|trident.*rv:)([\w.]+)/;
                var ma = window.navigator.userAgent.toLowerCase()
                var  match  = rMsie.exec(ma);  
                try {
                  return match[2];
                } catch (e) {
                  return IEMode;
                }
              },
              // Opera版本号
              operaVersion: function() {
                try {
                  if (window.opera) {
                    return agent.match(/opera.([\d.]+)/)[1];
                  } else if (agent.indexOf("opr") > 0) {
                    return agent.match(/opr\/([\d.]+)/)[1];
                  }
                } catch (e) {
                  return 0;
                }
              }
            }; 
     
            try {
              // 浏览器类型(IE、Opera、Chrome、Safari、Firefox)
              System.type = System.isIE ? "IE" :
                window.opera || (agent.indexOf("opr") > 0) ? "Opera" :
                (agent.indexOf("chrome") > 0) ? "Chrome" :
                //safari也提供了专门的判定方式
                window.openDatabase ? "Safari" :
                (agent.indexOf("firefox") > 0) ? "Firefox" :
                'unknow';
    
              // 版本号 
              System.version = (System.type === "IE") ? System.ieVersion() :
                (System.type === "Firefox") ? agent.match(/firefox\/([\d.]+)/)[1] :
                (System.type === "Chrome") ? agent.match(/chrome\/([\d.]+)/)[1] :
                (System.type === "Opera") ? System.operaVersion() :
                (System.type === "Safari") ? agent.match(/version\/([\d.]+)/)[1] :
                "0";
    
              // 浏览器外壳
              System.shell = function() {
    
                if (agent.indexOf("edge") > 0) {
                  System.version = agent.match(/edge\/([\d.]+)/)[1] || System.version;
                  return "edge浏览器";
                }
                // 遨游浏览器
                if (agent.indexOf("maxthon") > 0) {
                  System.version = agent.match(/maxthon\/([\d.]+)/)[1] || System.version;
                  return "傲游浏览器";
                }
                // QQ浏览器
                if (agent.indexOf("qqbrowser") > 0) {
                  System.version = agent.match(/qqbrowser\/([\d.]+)/)[1] || System.version;
                  return "QQ浏览器";
                }
    
                // 搜狗浏览器
                if (agent.indexOf("se 2.x") > 0) {
                  return '搜狗浏览器';
                }
    
                // Chrome:也可以使用window.chrome && window.chrome.webstore判断
                if (chrome && System.type !== "Opera") {
                  var external = window.external,
                    clientInfo = window.clientInformation,
                    // 客户端语言:zh-cn,zh.360下面会返回undefined
                    clientLanguage = clientInfo.languages;
    
                  // 猎豹浏览器:或者agent.indexOf("lbbrowser")>0
                  if (external && 'LiebaoGetVersion' in external) {
                    return '猎豹浏览器';
                  }
                  // 百度浏览器
                  if (agent.indexOf("bidubrowser") > 0) {
                    System.version = agent.match(/bidubrowser\/([\d.]+)/)[1] ||
                      agent.match(/chrome\/([\d.]+)/)[1];
                    return "百度浏览器";
                  }
                  // 360极速浏览器和360安全浏览器
                  if (System.supportSubTitle() && typeof clientLanguage === "undefined") {
                    // object.key()返回一个数组.包含可枚举属性和方法名称
                    var storeKeyLen = Object.keys(chrome.webstore).length,
                      v8Locale = "v8Locale" in window;
                    return storeKeyLen > 1 ? '360极速浏览器' : '360安全浏览器';
                  }
                  return "Chrome";
                }
                return System.type;
              };
    
              // 浏览器名称(如果是壳浏览器,则返回壳名称)
              System.name = System.shell();
              // 对版本号进行过滤过处理
              // System.version = System.versionFilter(System.version);
    
            } catch (e) {
            }
            return {
              client: System
            };
          })(window);
          if (Browser.client.name == undefined || Browser.client.name=="") {
            Browser.client.name = "Unknown";
            Browser.client.version = "Unknown";
          }else if(Browser.client.version == undefined){
            Browser.client.version = "Unknown";
          }
      return Browser ;
    }

    return {
      name: getBrowerInfo().client.name,
      version: getBrowerInfo().client.version
    }
  }

  // 采集用户当前IP地址
  // 通过设置读取 网易 API 获取IP地址和城市信息
  getUserLocalInfo() {
    return new Promise((resolve, reject) => {
      try {
        this.$axios.get(`${this.getLocalInfoApi}`).then(result => {
          if (result) {
            resolve({
              city: result.data.data.city,
              ip: result.data.data.query,
              country: result.data.data.country,
              isp: result.data.data.isp,
              regionName: result.data.data.regionName,
              timezone: result.data.data.timezone,
              longitude: result.data.data.lon,
              latitude: result.data.data.lat
            })
          } else {
            reject(`Unknown Error`);
          }
        });
      } catch (e) {
        throw new Error(e);
      }
    });
    
  }

  // 如果用户登陆，获取用户标识
  getUserFlagInfo() {
    // 待实现
  }

  // 获取当前用户屏幕的分辨率
  getUserResolution(type) {
    // type 1 为屏幕宽度 2为屏幕高度
    return type === 1 ? window.screen.width : window.screen.height 
  }

  // 当前访问的日期时间 本地时间不准确
  getCurrentVisitDateTime() {
    // 服务端实现...
  }

  // 当前信息来自哪一个系统，如：官网？ M站？ 业主公众号 ？ 等
  async getInfoSource() {
    // 如果初始化时已指定其系统编号，则直接返回该编号
    if (this.sysCode) return this.sysCode;

    // 如果未指定获取系统平台的枚举对象的 API 地址，则返回
    if (!this.getClientPlatformTypeApi) return;

    try {
      const { data } = await this.$axios.get(`${this.getClientPlatformTypeApi}/${this.appName}`);
      return data.code === '000' ? data.data.sysCode : '';
    } catch (e) {
      throw new Error(e);
    }
  }

  // 获取当前用户网络类型
  getNetworkType() {
    const ua = navigator.userAgent;
    let networkStr = ua.match(/NetType\/\w+/) ? ua.match(/NetType\/\w+/)[0] : 'NetType/other';
    networkStr = networkStr.toLowerCase().replace('nettype/', '');
    let networkType;
    switch (networkStr) {
      case 'wifi':
        networkType = 'wifi';
        break;
      case '4g':
        networkType = '4g';
        break;
      case '3g':
        networkType = '3g';
        break;
      case '3gnet':
        networkType = '3g';
        break;
      case '2g':
        networkType = '2g';
        break;
      default:
        networkType = 'other';
    }
    return networkType;
  }

  // 获取并返回当前访问的URL路径
  getCurrentURL() {
    return window.location.href;
  }

  // 判断是否第一次访问
  isFirstVisit() {
    if (handleWebStorage.getLocalData('data-report-flag')) {
      return 0;
    } else {
      handleWebStorage.setLocalData('data-report-flag', true);
      return 1;
    }
  }

  // 判断当前用户是否登陆
  // 根据本地存储的 access_token 是否存在来判断
  isLogin() {
    return handleWebStorage.getLocalData('access_token') ? 1 : 0;
  }

  // 初始化生成用户唯一id标识
  // 查询本地存储是否有用户唯一标识id，如果没有,则生成并存储
  getDistinctId() {
    let distinctId = handleWebStorage.getLocalData('distinctId');

    if (!distinctId) {
      distinctId = getRandomString();
      handleWebStorage.setLocalData('distinctId', distinctId);
    }
    return distinctId;
  }

  // 获取当前用户登陆的设备类型 PC ? Mobile ?
  _getUserDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    const isWindowsPhone = /(?:windows phone)/.test(ua);
    const isSymbian = /(?:symbianos)/.test(ua) || isWindowsPhone;
    const isAndroid = /(?:android)/.test(ua);
    const isTablet = /(?:ipad|playbook)/.test(ua) || (isAndroid && !/(?:mobile)/.test(ua));
    const isiPhone = /(?:iphone)/.test(ua) && !isTablet;
    const isPc = !isiPhone && !isAndroid && !isSymbian && !isWindowsPhone;
  
    const types = new Map([
      ['WindowsPhone', isWindowsPhone],
      ['Symbian', isSymbian],
      ['Android', isAndroid],
      ['Tablet', isTablet],
      ['iPhone', isiPhone],
      ['PC', isPc],
    ]);

    let currentType;
    types.forEach((key, val) => {
      if (key) {
        currentType = val;
      }
    });

    return currentType;
  }

  // 数据
  async dataInfo() {
    let localInfo, businessId;
    await this.getUserLocalInfo().then(result => {
      localInfo = Object.assign({}, result);
    });
    await this.getInfoSource().then(result => {
      businessId = result;
    }); 

    return {
      reportType: 'base_info',
      os: this.getUserOS()['name'],                           // 操作系统
      osVersion: this.getUserOS()['version'],                 // 操作系统版本
      screenWidth: this.getUserResolution(1),                 // 屏幕宽度
      screenHeight: this.getUserResolution(2),                // 屏幕高度
      browser: this.getUserBrowserInfo().name,                // 浏览器类型
      browserVersion: this.getUserBrowserInfo().version,      // 浏览器版本
      manufacturer: this._getUserDeviceType(),                // 设备类型
      businessId,                                             // ...
      networkType: this.getNetworkType(),
      isWifi: this.getNetworkType() === 'wifi' ? 1 : 0,
      latitude: localInfo.latitude,
      longitude: localInfo.longitude,
      appVersion: this.appVersion,
      extraInfo: {
        clientIp: localInfo.ip,
        city: localInfo.city,
        country: localInfo.country,
        isp: localInfo.isp,
        regionName: localInfo.regionName,
        timezone: localInfo.timezone,
      },
      visitUrl: this.getCurrentURL(),
      isFirstVisit: this.isFirstVisit(),
      isLogin: this.isLogin(),
      distinctId: this.getDistinctId(),
    };
  }

  // 上传操作
  async pushInfoData(pushData, reportType = 'base_info') {
    if (reportType === 'base_info') {
      // 判断是否第一次上报，否则停止，每次访问只上报基础信息一次
      if (handleWebStorage.getLocalData('base_info_reported', 'sessionStorage')) {
        return;
      }
    }

    if (!pushData) {
      return;
    }

    try {
      this.$axios.post(this.uploadInfoAddr, pushData).then(result => {
        if (result.data.code !== "000") {
          throw new Error(`请求成功，但上传数据失败`);
        } else {
          if (reportType === 'base_info') {
            handleWebStorage.setLocalData('base_info_reported', true, 'sessionStorage');
          }
        }
      });
    } catch (err) {
      throw new Error(err);
    }
  }
}