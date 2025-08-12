import request from '@/axios';

export default {
  // 外协价格
  loadBySpecificationName(params) {
    return request({
      url: `/blade-bip/OutsourcePrice/loadBySpecificationName`,
      method: 'get',
      params,
    });
  },
  // 外协价格-submit
  submit(data) {
    return request({
      url: `/blade-bip/OutsourcePrice/submit`,
      method: 'post',
      data,
    });
  },
  list(params) {
    return request({
      url: `/blade-bip/OutsourcePrice/list`,
      method: 'get',
      params,
    });
  },
};
