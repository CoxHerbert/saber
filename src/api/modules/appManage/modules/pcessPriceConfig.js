import request from '@/axios';

export default {
  getOutsourceTechnologyList(params) {
    return request({
      url: '/blade-bip/outsource-technology/list',
      method: 'get',
      params,
    });
  },
  getOutsourceTechnologyDetail(params) {
    return request({
      url: '/blade-bip/outsource-technology/detail',
      method: 'get',
      params,
    });
  },
  postOutsourceTechnology(data) {
    return request({
      url: '/blade-bip/outsource-technology/submit',
      method: 'post',
      data,
    });
  },
  removeOutsourceTechnology(ids) {
    return request({
      url: '/blade-bip/outsource-technology/remove',
      method: 'delete',
      params: {
        ids,
      },
    });
  },

  getOutsourceTechnologyList(params) {
    return request({
      url: '/blade-bip/outsource-technology/list',
      method: 'get',
      params,
    });
  },
  getOutsourceTechnologyDetail(params) {
    return request({
      url: '/blade-bip/outsource-technology/detail',
      method: 'get',
      params,
    });
  },
  postConfigItem(data) {
    return request({
      url: '/blade-bip/dc/mops/technology/config/item/submit',
      method: 'post',
      data,
    });
  },
  removeConfigItem(ids) {
    return request({
      url: '/blade-bip/dc/mops/technology/config/item/remove',
      method: 'delete',
      params: {
        ids,
      },
    });
  },
};
