// /blade-bip/dc/hr/drive/list-with-flow

import request from '@/axios';

export default {
  list(params) {
    return request({
      url: '/blade-bip/dc/hr/drive/list-with-flow',
      method: 'get',
      params,
    });
  },
};
