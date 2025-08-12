import request from '@/axios';

export default {
  // 计划模板列表
  list(params) {
    return request({
      url: '/blade-bip/dc-mmr-product-dept/list',
      method: 'get',
      params,
    });
  },
  // 提交或保存
  submit(data) {
    return request({
      url: '/blade-bip/dc-mmr-product-dept/submit',
      method: 'post',
      data,
    });
  },
  // 模板详情
  detail(params) {
    return request({
      url: '/blade-bip/dc-mmr-product-dept/detail',
      method: 'get',
      params,
    });
  },
  // 模板删除
  remove(params) {
    return request({
      url: '/blade-bip/dc-mmr-product-dept/remove',
      method: 'delete',
      params,
    });
  },
};
