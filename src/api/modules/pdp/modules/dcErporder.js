import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/dc/erpOrder/item-list',
      method: 'get',
      params,
    });
  },

  // 详情
  detail(params) {
    return request({
      url: '/blade-bip/dc/erpOrder/detail',
      method: 'get',
      params,
    });
  },

  // 执行单取回
  retrieveOrder(params) {
    return request({
      url: '/blade-bip/dc/erp/order/ne/retrieve',
      method: 'get',
      params,
    });
  },

  //   保存
  submit(data) {
    return request({
      url: '/blade-bip/dc/erpOrder/submit',
      method: 'post',
      data,
    });
  },
  // 保存
  saveItem(data) {
    return request({
      url: '/blade-bip/dc/erp/order/ne/save-item',
      method: 'post',
      data,
    });
  },

  // 提交
  pass(data) {
    return request({
      url: '/blade-bip/dc/erpOrder/pass',
      method: 'post',
      data,
    });
  },

  // 驳回
  reject(data) {
    return request({
      url: '/blade-bip/dc/erpOrder/reject',
      method: 'post',
      data,
    });
  },

  // 主数据列表
  erpList(params) {
    return request({
      url: '/blade-bip/dc/erp/order/item/list',
      method: 'get',
      params,
    });
  },

  orderSubmit(data) {
    return request({
      url: '/blade-bip/dc/erp/order/item/submit',
      method: 'post',
      data,
    });
  },

  orderSubmitList(data) {
    return request({
      url: '/blade-bip/dc/erp/order/item/submit-list',
      method: 'post',
      data,
    });
  },

  orderSubmitTpmList(data) {
    return request({
      url: '/blade-bip/dc/erpOrder/submit-tpm',
      method: 'post',
      data,
    });
  },

  //  字典
  dict(params) {
    return request({
      url: '/blade-bip/dc/erp/biz/type-map',
      method: 'get',
      params,
    });
  },

  // 删除

  remove(params) {
    return request({
      url: '/blade-bip/dc/erpOrder/remove',
      method: 'DELETE',
      params,
    });
  },

  neList(params) {
    return request({
      // url: '/blade-bip/dc/erp/order/ne/list',
      url: '/blade-bip/dc/erp/order/ne/list',
      method: 'get',
      params,
    });
  },

  nePass(data, query) {
    return request({
      url: query?.orgId
        ? `/blade-bip/dc/erp/order/ne/pass?orgId=${query?.orgId}&stockOrgId=${query?.stockOrgId}`
        : '/blade-bip/dc/erp/order/ne/pass',
      method: 'post',
      data,
    });
  },
  neReject(data) {
    return request({
      url: '/blade-bip/dc/erp/order/ne/reject',
      method: 'post',
      data,
    });
  },

  neDetail(params) {
    return request({
      url: '/blade-bip/dc/erp/order/ne/detail',
      method: 'get',
      params,
    });
  },
  neGetDetail(params) {
    return request({
      url: '/blade-bip/dc/erp/order/ne/get-detail',
      method: 'get',
      params,
    });
  },
  neSubmit(data) {
    return request({
      url: '/blade-bip/dc/erp/order/ne/submit',
      method: 'post',
      data,
    });
  },
  neDelete(params) {
    return request({
      url: '/blade-bip/dc/erp/order/ne/remove',
      method: 'DELETE',
      params,
    });
  },
  getAuditUsers(params) {
    return request({
      url: '/blade-bip/dc/erp/select/header-audit',
      method: 'get',
      params,
    });
  },
};
