import request from '@/axios';

export default {
  // 分页查询
  list(params) {
    return request({
      url: '/blade-bip/pdp-file-share/page-list',
      method: 'get',
      params,
    });
  },
};
