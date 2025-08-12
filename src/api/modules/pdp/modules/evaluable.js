import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/fea-evaluation-problem/list',
      method: 'get',
      params,
    });
  },

  // 保存
  submit(data) {
    return request({
      url: '/blade-bip/fea-evaluation-problem/submit',
      method: 'post',
      data,
    });
  },

  // 删除
  remove(params) {
    return request({
      url: '/blade-bip/fea-evaluation-problem/remove',
      method: 'DELETE',
      params,
    });
  },

  planList(params) {
    return request({
      url: '/blade-bip/plan-item/list',
      method: 'get',
      params,
    });
  },
};
