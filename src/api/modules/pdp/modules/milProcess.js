import request from '@/axios';

export default {
  // 主数据列表
  // list(params) {
  //   return request({
  //     url: '/blade-bip/mil-process-data/list',
  //     method: 'get',
  //     params,
  //   });
  // },
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/mil-process-data/list',
      method: 'get',
      params,
    });
  },
  getProcessTask(params) {
    return request({
      url: '/blade-workflow/feign/client/process/process-task',
      method: 'get',
      params,
    });
  },
  getProcessTaskV2(params) {
    return request({
      url: '/blade-workflow/feign/client/process/hi/process-task',
      method: 'get',
      params,
    });
  },
};
