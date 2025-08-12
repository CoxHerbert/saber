import request from '@/axios';

// 列表
export default {
  list(params) {
    return request({
      url: '/blade-bip/dc-common-constant/list',
      method: 'get',
      params,
    });
  },
  update(data) {
    return request({
      url: '/blade-bip/dc-common-constant/submit',
      method: 'post',
      data,
    });
  },
  remove(data) {
    return request({
      url: '/blade-bip/dc-common-constant/remove?ids=' + data.ids,
      method: 'DELETE',
      data,
    });
  },
};
