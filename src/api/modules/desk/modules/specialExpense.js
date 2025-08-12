import request from '@/axios';

export default {
  list(params) {
    return request({
      url: '/blade-bip/dc/scm/special-expense/list-with-flow',
      method: 'get',
      params,
    });
  },
};
