import request from '@/axios';

export default {
  list(params) {
    return request({
      url: '/blade-bip/mps/process-maintenance/list',
      method: 'get',
      params,
    });
  },
  remove(params) {
    return request({
      url: '/blade-bip/mps/process-maintenance/delete',
      method: 'post',
      params,
    });
  },
  create(data) {
    return request({
      url: '/blade-bip/mps/process-maintenance/insert',
      method: 'post',
      data,
    });
  },
  update(data) {
    return request({
      url: '/blade-bip/mps/process-maintenance/update',
      method: 'post',
      data,
    });
  },
};
