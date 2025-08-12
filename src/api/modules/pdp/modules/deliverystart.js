import request from '@/axios';

export default {
  // 主数据列表
  list(params) {
    return request({
      url: '/blade-bip/delivered/list',
      method: 'get',
      params,
    });
  },

  // 删除
  remove(params) {
    return request({
      url: '/blade-bip/delivered/remove',
      method: 'DELETE',
      params,
    });
  },

  // 详情
  detail(params) {
    return request({
      url: '/blade-bip/delivered/delivered-detail',
      method: 'get',
      params,
    });
  },

  //启动会编辑提交
  submit(data) {
    return request({
      url: '/blade-bip/delivered/submit',
      method: 'post',
      data,
    });
  },

  // 启动会创建
  createDelivered(data) {
    return request({
      url: '/blade-bip/delivered/delivered-submit',
      method: 'post',
      data,
    });
  },
};
