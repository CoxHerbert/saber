import request from '@/axios';

export default {
  getOutsourcePriceList(params) {
    return request({
      url: '/blade-bip/OutsourcePrice/list',
      method: 'get',
      params,
    });
  },
  removeOutsourcePrice(ids) {
    return request({
      url: '/blade-bip/OutsourcePrice/remove',
      method: 'delete',
      params: {
        ids,
      },
    });
  },
  postOutsourcePrice(data) {
    return request({
      url: '/blade-bip/OutsourcePrice/submit',
      method: 'post',
      data,
    });
  },
};
