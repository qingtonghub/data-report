/*
 * @Description: 工具函数
 * @Author: qingtong
 * @Date: 2019-05-25 18:54:10
 * @Last Modified by: qingtong
 * @Last Modified time: 2019-05-25 19:21:15
 */

/**
 * @description 封装localstorage 增删查改
 * @param none
 * @author qingtong
 * @returns Object
 */
export const handleWebStorage = {
  // 设置storage
  setLocalData: (key, value, type = 'localStorage') => {
    // 如果value为对象或数组，则进行序列化
    if (Object.prototype.toString.call(value) === '[object Object]' ||
      Object.prototype.toString.call(value) === '[object Array]') {
      value = JSON.stringify(value);
    }

    if (type === 'localStorage') {
      // 如果操作为默认的localStorge
      localStorage.setItem(key, value);
    } else if (type === 'sessionStorage') {
      sessionStorage.setItem(key, JSON.stringify(value));
    } else {
      throw new Error('params "type" is Error, it must able of "localStorage" or "sessionStorage"');
    }
  },
  // 获取
  getLocalData: (key, type = 'localStorage') => {
    if (type === 'localStorage') {
      const temp = localStorage.getItem(key);
      if (Object.prototype.toString.call(temp) === '[object Object]') {
        return JSON.parse(temp);
      } else {
        return temp;
      }
      // return JSON.parse(localStorage.getItem(key));
    } else if (type === 'sessionStorage') {
      const temp = sessionStorage.getItem(key);
      if (Object.prototype.toString.call(temp) === '[object Object]') {
        return JSON.parse(temp);
      } else {
        return temp;
      }
      // return JSON.parse(sessionStorage.getItem(key): string | null);
    }
  },
  // 删除某条数据
  removeLocalData: (key, type = 'localStorage') => {
    if (type === 'localStorage') {
      localStorage.removeItem(key);
    } else {
      sessionStorage.removeItem(key);
    }
  },

  // 清空数据
  clearLocalData: (type = 'localStorage') => {
    if (type === 'localStorage') {
      localStorage.clear();
    } else {
      sessionStorage.clear();
    }
  },

  // 批量将对象参数中的信息存入本地
  batchSetLocalData: (obj, type = 'localStorage') => {
    if (Object.prototype.toString.call(obj) !== '[object Object]') {
      throw new Error('params "obj" must be a Object');
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (type === 'localStorage') {
          localStorage.setItem(key, obj[key]);
        } else {
          sessionStorage.setItem(key, obj[key]);
        }
      }
    }
  },
};

/**
 * @description 返回随机子串
 * @param int 返回子串长度
 * @author qingtong
 * @return String
 */
export function getRandomString(len = 7) {
  // len = len > 32 ? 32 : len;
  // const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  // const maxLen = $chars.length;
  // let randomStr = '';

  // for (let i = 0; i < len; i++) {
  //   randomStr += $chars.charAt(Math.floor(Math.random() * maxLen));
  // }
  // return randomStr;

  // https://github.com/reduxjs/redux/blob/master/src/utils/actionTypes.js
  const getRan = () => Math.random().toString(36).substring(2);
  return (getRan() + getRan() + getRan()).substring(0, len);
  
}