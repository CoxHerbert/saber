import request from '@/axios';

// 工作组
export default {
  list(params) {
    return request({
      url: '/blade-bip/mps/produce-route/list',
      method: 'get',
      params,
    });
  },
  remove(params) {
    return request({
      url: '/blade-bip/mps/produce-route/delete',
      method: 'post',
      params,
    });
  },
  create(data) {
    return request({
      url: '/blade-bip/mps/produce-route/insert',
      method: 'post',
      data,
    });
  },
  update(data) {
    return request({
      url: '/blade-bip/mps/produce-route/edit',
      method: 'post',
      data,
    });
  },
};
