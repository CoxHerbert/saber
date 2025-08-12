import request from '@/axios';

export default {
  // 仓库列表
  list(params) {
    return request({
      url: '/blade-bip/dc-wms-common/list',
      method: 'get',
      params,
    });
  },
};
