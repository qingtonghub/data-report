/*
 * @Description: 用户行为收集
 * @Author: qingtong
 * @Date: 2019-05-25 20:06:58
 * @Last Modified by: qingtong
 * @Last Modified time: 2019-05-26 21:47:16
 */

//  https://juejin.im/post/5b231f6ff265da595f0d2540

import BaseDataReport from './BaseDataReport';

export default class BehaviorDataReport extends BaseDataReport{
  constructor(options) {
    super(options);
    this._baseInfoObject = null;
  }

  // 用户登入系统事件
  userLoginEvent(obj) {
    this.handleEventReport(obj, 'userLogin');
  }

   // 用户登出系统事件
   userLogoutEvent() {
    this.handleEventReport(obj, 'userLogout');
  }

  // 页面浏览事件
  pageViewEvent() {
    this.handleEventReport(obj, 'pageViewLogout');
  }

  // 详情浏览事件
  detailViewEvent() {
    this.handleEventReport(obj, 'detailView');
  }

  // 菜单跳转事件
  menuSwitchEvent() {
    this.handleEventReport(obj, 'menuSwitch');
  }

  // 点击事件
  clickEvent() {
    this.handleEventReport(obj, 'click');
  }

  // 搜索事件
  searchEvent() {
    this.handleEventReport(obj, 'search');
  }

  // 广告转换
  adTouchEvent() {
    this.handleEventReport(obj, 'adTouch');
  }

  // 查询列表事件
  listSearchEvent() {
    this.handleEventReport(obj, 'listSearch');
  }

  // 新建条目提交事件
  newItemSubmitEvent() {
    this.handleEventReport(obj, 'newItemSubmit');
  }

  // 修改条目提交事件
  updateItemSubmitEvent() {
    this.handleEventReport(obj, 'updateItemSubmit');
  }

  // 删除条目提交事件
  deleteItemSubmitEvent() {
    this.handleEventReport(obj, 'deleteItemSubmit');
  }

  // 上传（导入）事件
  uploadInfoEvent() {
    this.handleEventReport(obj, 'uploadInfo');
  }

  // 下载（导出）事件
  downloadInfoEvent() {
    this.handleEventReport(obj, 'downloadInfo');
  }

  /**
   * @description 统一事件处理
   * @param Object 需要提交的额外参数
   * @param eventName 事件名称
   * @returns void
   */
  async handleEventReport(obj, eventName = '') {
    const objParams = obj ? obj : {};

    if (!this._baseInfoObject) {
      this._baseInfoObject = await this._getBaseInfoObject();
    }

    const resultObj = Object.assign(
      objParams, 
      {
        reportType: `behavior_info`,
        distinctId: _baseInfoObject.distinctId,
        businessId: _baseInfoObject.businessId,
      },
      { eventType: eventName }
    );

    this.pushInfoData(resultObj, 'behavior_info');
  }

  // 私有方法，调用基类方法 dataInfo 获取基础信息
  _getBaseInfoObject() {
    const data = await this.dataInfo();
    return data;
  }
}