import request from '@/axios';

export default {
  // 获取当前用户小组信息
  getWorkGroupInfo() {
    return request({
      url: '/blade-bip/mps/work-group/get-work-group-info',
      method: 'get',
    });
  },
};
