import request from '@/axios';

// 列表
export default {
  getList(params) {
    return request({
      url: '/blade-bip/ScmMaterial/list',
      method: 'get',
      params,
    });
  },

  // 添加和修改
  submit(data) {
    return request({
      url: '/blade-bip/ScmMaterial/submit',
      method: 'post',
      data,
    });
  },

  // 详情
  getDetail(params) {
    return request({
      url: '/blade-bip/ScmMaterial/detail',
      method: 'get',
      params,
    });
  },

  // 审核
  toExamine(data) {
    return request({
      url: '/blade-bip/ScmMaterial/material-update',
      method: 'post',
      data,
    });
  },

  // 删除
  remove(ids) {
    return request({
      url: '/blade-bip/ScmMaterial/material-remove',
      method: 'post',
      params: {
        ids,
      },
    });
  },
};
