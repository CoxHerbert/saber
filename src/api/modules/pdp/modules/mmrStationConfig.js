import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/mmr-station-config/list',
      method: 'get',
      params,
    });
  },

  // 保存接口
  submit(data) {
    return request({
      url: '/blade-bip/mmr-station-config/submit',
      method: 'post',
      data,
    });
  },
  // 删除接口
  remove(params) {
    return request({
      url: '/blade-bip/mmr-station-config/remove',
      method: 'DELETE',
      params,
    });
  },
};
