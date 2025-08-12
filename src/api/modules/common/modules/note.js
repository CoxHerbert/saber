import request from '@/axios';

export default {
  // 列表
  list(params) {
    return request({
      url: '/blade-bip/note/list',
      method: 'get',
      params,
    });
  },

  // 详情
  detail(params) {
    return request({
      url: '/blade-bip/note/detail',
      method: 'get',
      params,
    });
  },

  // 保存
  submit(data) {
    return request({
      url: '/blade-bip/note/submit',
      method: 'post',
      data,
    });
  },

  // 删除
  remove(params) {
    return request({
      url: '/blade-bip/note/remove',
      method: 'DELETE',
      params,
    });
  },
};
