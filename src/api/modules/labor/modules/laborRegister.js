import request from '@/axios';

export default {
  // 批量入职
  bulkOnboarding(data) {
    return request({
      url: '/blade-bip/laborRegister/bulk-onboarding',
      method: 'post',
      data,
    });
  },
  // 批量拒绝入职
  refusalToOnboard(data) {
    return request({
      url: '/blade-bip/laborRegister/refusal-to-onboard',
      method: 'post',
      data,
    });
  },
};
