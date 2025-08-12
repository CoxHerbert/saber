import request from '@/axios';

export default {
  // 分页查询列表
  list(params) {
    return request({
      url: '/blade-bip/item/schedule/list',
      method: 'get',
      params,
    });
  },
  // 分页查询列表
  submit(data) {
    return request({
      url: '/blade-bip/item/schedule/updateDailyTimeCount',
      method: 'post',
      data,
    });
  },
};
