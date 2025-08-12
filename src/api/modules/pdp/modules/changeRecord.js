import request from '@/axios';

export default {
  // 提交流程
  sumbitProcess(data) {
    return request({
      url: '/blade-bip/change-record/sumbitProcess',
      method: 'post',
      data,
    });
  },
  // 分页查询列表
  list(params) {
    return request({
      url: '/blade-bip/change-record/list',
      method: 'get',
      params,
    });
  },
};
