import request from '@/axios';

export default {
  // 代办流程/任务数量
  getWorkCount() {
    return request({
      url: '/blade-bip/plan-item/work-count',
      method: 'get',
    });
  },
};
