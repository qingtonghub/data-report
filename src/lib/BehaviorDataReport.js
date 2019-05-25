/*
 * @Description: 用户行为收集
 * @Author: qingtong
 * @Date: 2019-05-25 20:06:58
 * @Last Modified by: qingtong
 * @Last Modified time: 2019-05-25 20:14:40
 */

import BaseDataReport from './BaseDataReport';

export default class BehaviorDataReport extends BaseDataReport{
  constructor(options) {
    super(options);
    this._baseInfoObject = null;
  }

  // 用户登入系统事件
  userLoginEvent() {
    // ...
  }

   // 用户登出系统事件
   userLogoutEvent() {
    // ...
  }

  // 页面浏览事件
  pageViewEvent() {
    // ...
  }

  // 详情浏览事件
  detailViewEvent() {
    // ...
  }

  // 菜单跳转事件
  menuSwitchEvent() {
    // ...
  }

  // 点击事件
  clickEvent() {
    // ...
  }

  // 搜索事件
  searchEvent() {
    // ...
  }

  // 广告转换
  adTouchEvent() {
    // ...
  }

  // 查询列表事件
  listSearchEvent() {
    // ...
  }

  // 新建条目提交事件
  newItemSubmitEvent() {
    // ...
  }

  // 修改条目提交事件
  updateItemSubmitEvent() {
    // ...
  }

  // 删除条目提交事件
  deleteItemSubmitEvent() {
    // ...
  }

  // 上传（导入）事件
  uploadInfoEvent() {
    // ...
  }

  // 下载（导出）事件
  downloadInfoEvent() {
    // ...
  }

  // 私有方法，调用基类方法 dataInfo 获取基础信息
  _getBaseInfoObject() {
    // ...
  }
}