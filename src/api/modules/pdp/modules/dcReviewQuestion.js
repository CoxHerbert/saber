import request from '@/axios';

export default {
  //   列表
  list(params) {
    return request({
      url: '/blade-bip/dc-review-problem/list',
      method: 'get',
      params,
    });
  },
  getDetailById(params) {
    return request({
      url: '/blade-bip/dc-review-problem/get-detail-by-id',
      method: 'get',
      params,
    });
  },
  submit(data) {
    return request({
      url: '/blade-bip/dc-review-problem/submit',
      method: 'post',
      data,
    });
  },
};
