import request from '@/axios';

export default {
  // 转单明细查询
  getOrderTransDetail(params) {
    return request({
      url: '/blade-bip/dc/mes/transfer/detail',
      method: 'get',
      params,
    });
  },
  // 转单记录
  getOrderTransList(params) {
    return request({
      url: '/blade-bip/dc/mes/transfer/list',
      method: 'get',
      params,
    });
  },
  // 转单
  postOrderTrans(data) {
    return request({
      url: '/blade-bip/dc/mes/transfer/order-transfer',
      method: 'post',
      data,
    });
  },
  // 获取供应商列表
  getSupplierList(params) {
    return request({
      url: '/blade-bip/dc/mes/transfer/supplier-list',
      method: 'get',
      params,
    });
  },
};
