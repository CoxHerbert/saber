import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/fea-evaluation/list',
      method: 'get',
      params,
    });
  },

  // 保存
  subimt(data) {
    return request({
      url: '/blade-bip/fea-evaluation/submit',
      method: 'post',
      data,
    });
  },

  // 删除
  remove(ids) {
    return request({
      url: '/blade-bip/fea-evaluation/remove',
      method: 'DELETE',
      params: {
        ids,
      },
    });
  },

  // 明细
  details(params) {
    return request({
      url: '/blade-bip/fea-evaluation/details',
      method: 'get',
      params,
    });
  },

  demo(params) {
    return request({
      url: '/blade-bip/dc-fea/init-template',
      method: 'get',
      params,
    });
  },
};
