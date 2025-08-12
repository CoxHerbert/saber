import request from '@/axios';

export default {
  // 收藏 取消收藏
  getTrackList(params) {
    return request({
      url: '/blade-bip/sip/track/list',
      method: 'get',
      params,
    });
  },
};
