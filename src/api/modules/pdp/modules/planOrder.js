import request from '@/axios';

export default {
  getMrpSplitOrder(params) {
    return request({
      url: '/blade-erp/plan-order/find-mrp-split-order',
      method: 'get',
      params,
    });
  },
  // 提交修改数据
  updateList(data, params) {
    return request({
      url: '/blade-erp/plan-order/update-list',
      method: 'post',
      data,
      params,
    });
  },
  // // 导出当前页
  // exportPage(params) {
  //   return request({
  //     url: '/blade-erp/plan-order/find-mrp-split-order-export',
  //     method: 'get',
  //     params,
  //   });
  // },

  // 提交保存数据
  pusherpList(data, params) {
    return request({
      url: '/blade-erp/plan-order/push-erp',
      method: 'post',
      data,
      params,
    });
  },
  // 获取单据类型
  getMrpOrderType() {
    return request({
      url: '/blade-erp/plan-order/find-mrp-order-type',
      method: 'get',
    });
  },

  // 获取单据类型
  deliveredList(params) {
    return request({
      url: '/blade-bip/delivered-item/list',
      method: 'get',
      params,
    });
  },
};
