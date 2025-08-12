import request from '@/axios';

// 列表
export default {
  list(params) {
    return request({
      url: '/blade-bip/scm-audit-node-config/list',
      method: 'get',
      params,
    });
  },

  // 添加和修改
  submit(data) {
    return request({
      url: '/blade-bip/scm-audit-node-config/submit',
      method: 'post',
      data,
    });
  },

  // 详情
  detail(params) {
    return request({
      url: '/blade-bip/scm-audit-node-config/detail',
      method: 'get',
      params,
    });
  },
  // 删除
  remove(ids) {
    return request({
      url: '/blade-bip/scm-audit-node-config/remove',
      method: 'delete',
      params: { ids },
    });
  },
};
