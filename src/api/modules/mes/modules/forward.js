import request from '@/axios';

export default {
  // 工序转发列表
  getForwardList(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/list',
      method: 'get',
      params,
    });
  },
  // 工序转发详情
  getForwardDetail(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/detail',
      method: 'get',
      params,
    });
  },
  // 提交
  submitForward(data) {
    return request({
      url: '/blade-bip/dc/mes/forward/submit',
      method: 'post',
      data,
    });
  },
  // 删除
  deleteForward(data) {
    return request({
      url: '/blade-bip/dc/mes/forward/remove',
      method: 'delete',
      data,
    });
  },
  // 库存物料列表
  getStockMaterialList(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/stock-material-list',
      method: 'get',
      params,
    });
  },
  // 保存明细
  saveItem(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/save-item',
      method: 'post',
      params,
    });
  },
  // 获取参考工序
  getReferenceProcess(params) {
    console.log(params);
    return request({
      url: '/blade-bip/dc/mes/forward/get-reference-process',
      method: 'get',
      params,
    });
  },
};
