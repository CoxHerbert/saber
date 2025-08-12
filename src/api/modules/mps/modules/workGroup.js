import request from '@/axios';

// 工作组
export default {
  list(params) {
    return request({
      url: '/blade-bip/mps/work-group/list',
      method: 'get',
      params,
    });
  },
  remove(params) {
    return request({
      url: '/blade-bip/mps/work-group/delete',
      method: 'post',
      params,
    });
  },
  create(data) {
    return request({
      url: '/blade-bip/mps/work-group/insert',
      method: 'post',
      data,
    });
  },
  update(data) {
    return request({
      url: '/blade-bip/mps/work-group/edit',
      method: 'post',
      data,
    });
  },
};
