import request from '@/axios';

export default {
  // scm-出库单-list
  getList(params) {
    return request({
      url: '/blade-bip/scm-out-stock/list',
      method: 'get',
      params,
    });
  },
  // scm-出库单-detail
  getDetail(params) {
    return request({
      url: '/blade-bip/scm-out-stock/detail',
      method: 'get',
      params,
    });
  },
  // scm-出库单-submit
  submit(data) {
    return request({
      url: '/blade-bip/scm-out-stock/submit',
      method: 'post',
      data,
    });
  },
  // scm-出库单-remove
  remove(params) {
    return request({
      url: '/blade-bip/scm-out-stock/remove',
      method: 'delete',
      params,
    });
  },
  // scm-出库单-audit
  audit(data) {
    return request({
      url: '/blade-bip/scm-out-stock/audit',
      method: 'post',
      data,
    });
  },
};
