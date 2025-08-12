import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/station-apply/list',
      method: 'get',
      params,
    });
  },
  // 入驻信息详情
  detail(params) {
    return request({
      url: '/blade-bip/station-apply/detail',
      method: 'get',
      params,
    });
  },
  // 入驻申请-submit
  submit(data) {
    return request({
      url: '/blade-bip/station-apply/submit',
      method: 'post',
      data,
    });
  },
  // 入驻申请-remove
  remove(params) {
    return request({
      url: '/blade-bip/station-apply/remove',
      method: 'delete',
      params,
    });
  },
  // 入驻申请-audit
  audit(data) {
    return request({
      url: '/blade-bip/station-apply/audit',
      method: 'post',
      data,
    });
  },
};
