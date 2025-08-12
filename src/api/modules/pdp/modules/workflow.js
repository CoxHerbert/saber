import request from '@/axios';

export default {
  // 流程创建url
  getWorkflow(params) {
    return request({
      url: '/blade-workflow/workflow/top-title',
      method: 'get',
      params,
    });
  },
};
