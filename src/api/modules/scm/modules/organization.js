import request from '@/axios';

export default {
  // 组织列表
  getList(params) {
    return request({
      url: '/blade-bip/ScmOrg/list',
      method: 'get',
      params,
    });
  },

  // 添加和修改
  submit(data) {
    return request({
      url: '/blade-bip/ScmOrg/submit',
      method: 'post',
      data,
    });
  },

  // 删除
  remove(ids) {
    return request({
      url: '/blade-bip/ScmOrg/remove',
      method: 'delete',
      params: {
        ids,
      },
    });
  },
};
