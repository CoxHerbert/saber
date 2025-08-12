import request from '@/axios';

// 列表
export default {
  getList(params) {
    return request({
      url: '/blade-bip/scm-in-stock/list',
      method: 'get',
      params,
    });
  },

  // 添加和修改
  submit(data) {
    return request({
      url: '/blade-bip/scm-in-stock/submit',
      method: 'post',
      data,
    });
  },

  // 详情
  getDetail(params) {
    return request({
      url: '/blade-bip/scm-in-stock/detail',
      method: 'get',
      params,
    });
  },

  //   // 保存
  //   supplierUpdate(data) {
  //     return request({
  //       url: '/blade-bip/dc-wms-in-stock/submit-audit',
  //       method: 'post',
  //       data,
  //     });
  //   },

  // 审核
  wareHouseAudit(data) {
    return request({
      url: '/blade-bip/scm-in-stock/audit',
      method: 'post',
      data,
    });
  },
  // 审核驳回
  wareHouseReject(data) {
    return request({
      url: '/blade-bip/dc-wms-in-stock/reject',
      method: 'post',
      data,
    });
  },
  // 删除
  remove(ids) {
    return request({
      url: '/blade-bip/dc-wms-in-stock-detail/remove',
      method: 'delete',
      params: {
        ids,
      },
    });
  },
};
