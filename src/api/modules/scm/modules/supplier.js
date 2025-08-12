import request from '@/axios';

// 列表
export default {
  getList(params) {
    return request({
      url: '/blade-bip/ScmSupplier/list',
      method: 'get',
      params,
    });
  },

  // 添加和修改
  submit(data) {
    return request({
      url: '//blade-bip/ScmSupplier/supplier-submit',
      method: 'post',
      data,
    });
  },

  // 详情
  getDetail(params) {
    return request({
      url: '/blade-bip/ScmSupplier/supplier-detail',
      method: 'get',
      params,
    });
  },

  // 审核
  supplierUpdate(data) {
    return request({
      url: '/blade-bip/ScmSupplier/supplier-update',
      method: 'post',
      data,
    });
  },

  // 删除
  remove(ids) {
    return request({
      url: '/blade-bip/ScmSupplier/supplier-remove',
      method: 'post',
      params: {
        ids,
      },
    });
  },
};
