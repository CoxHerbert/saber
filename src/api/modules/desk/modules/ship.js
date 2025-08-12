import request from '@/axios';

export default {
  list(params) {
    return request({
      url: '/blade-bip/dc/scm/ship/list-with-flow',
      method: 'get',
      params,
    });
  },
};
