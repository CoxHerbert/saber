import request from '@/axios';

export default {
  // 列表分页查询
  getSupplierList(params) {
    return request({
      url: '/blade-erp/pro/supplier-list',
      method: 'get',
      params,
    });
  },
  // 列表分页查询
  getStockMaterialList(params) {
    return request({
      url: '/blade-erp/pro/stock-material-list',
      method: 'get',
      params,
    });
  },

  // 工序工作查询
  getWorkCenterList(params) {
    return request({
      url: '/blade-erp/pro/work-center-list',
      method: 'get',
      params,
    });
  },
  // 工序作业查询
  getActivityCenterList(params) {
    return request({
      url: '/blade-erp/pro/activity-center-list',
      method: 'get',
      params,
    });
  },
  // 工序外发详情
  getProDetail(params) {
    return request({
      url: '/blade-bip/ErpProcessOutsourc/pro-detail',
      method: 'get',
      params,
    });
  },
  // 工序外发保存
  proSubmit(data) {
    return request({
      url: '/blade-bip/ErpProcessOutsourc/pro-submit',
      method: 'post',
      data,
    });
  },
};
