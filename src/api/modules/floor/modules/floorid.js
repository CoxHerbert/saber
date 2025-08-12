import request from '@/axios';

export default {
  // 根据设备ID获取楼层数据
  getfloorleader(params) {
    return request({
      url: '/blade-bip/floor-leader/skip-url/load-floor-leader-by-equipment-id',
      method: 'get',
      params,
    });
  },
  // 获取设备列表
  getdevicelist(params) {
    return request({
      url: '/blade-bip/smart-box/list',
      method: 'get',
      params,
    });
  },
  // 楼层负责人列表查询
  listFloorLeader(params) {
    return request({
      url: '/blade-bip/dc-am-floor-leader/list',
      method: 'get',
      params,
    });
  },
  // 新增楼层负责人
  submitFloorLeader(data) {
    return request({
      url: '/blade-bip/dc-am-floor-leader/submit',
      method: 'post',
      data,
    });
  },
  // 修改楼层负责人
  updateFloorLeader(data) {
    return request({
      url: '/blade-bip/dc-am-floor-leader/select-data',
      method: 'post',
      data,
    });
  },
  // 删除楼层负责人
  deleteFloorLeader(params) {
    return request({
      url: '/blade-bip/dc-am-floor-leader/remove',
      method: 'delete',
      params,
    });
  },
  // 每日一句/blade-bip/home-user/skip-url/random-sentence
  randomSentence(params) {
    return request({
      url: '/blade-bip/home-user/skip-url/random-sentence',
      method: 'get',
      params,
    });
  },
  // 采购订单列表查询
  listPurchaseOrder(params) {
    return request({
      url: '/blade-erp/erp-po-order/xky-po-list/skip-url',
      method: 'get',
      params,
    });
  },
};
